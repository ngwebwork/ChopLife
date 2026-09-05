package services

import (
	"context"
	"time"

	"choplife-backend/database"
	"choplife-backend/models"
	"choplife-backend/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type OrderService struct {
	menuService     *MenuService
	settingsService *SettingsService
}

func NewOrderService() *OrderService {
	return &OrderService{
		menuService:     NewMenuService(),
		settingsService: NewSettingsService(),
	}
}

func (s *OrderService) collection() *mongo.Collection {
	return database.Collection("orders")
}

// Create validates every ordered item against the live menu, computes
// authoritative prices/subtotals server-side (never trusting client-supplied
// prices), applies the configured delivery fee, and persists the order.
func (s *OrderService) Create(ctx context.Context, input models.CreateOrderInput) (*models.Order, error) {
	if input.PaymentMethod != models.PaymentMethodCOD && input.PaymentMethod != models.PaymentMethodDemo {
		return nil, ErrInvalidInput
	}

	menuItemIDs := make([]primitive.ObjectID, 0, len(input.Items))
	for _, item := range input.Items {
		objID, err := primitive.ObjectIDFromHex(item.MenuItemID)
		if err != nil {
			return nil, ErrInvalidInput
		}
		menuItemIDs = append(menuItemIDs, objID)
	}

	menuItems, err := s.menuService.GetManyByIDs(ctx, menuItemIDs)
	if err != nil {
		return nil, err
	}

	orderItems := make([]models.OrderItem, 0, len(input.Items))
	var subtotal float64

	for i, itemInput := range input.Items {
		menuItem, ok := menuItems[menuItemIDs[i]]
		if !ok {
			return nil, ErrNotFound
		}
		if !menuItem.Available {
			return nil, ErrInvalidInput
		}

		extrasTotal := 0.0
		validatedExtras := make([]models.Extra, 0, len(itemInput.Extras))
		for _, requestedExtra := range itemInput.Extras {
			for _, menuExtra := range menuItem.Extras {
				if requestedExtra.Name == menuExtra.Name {
					validatedExtras = append(validatedExtras, menuExtra)
					extrasTotal += menuExtra.Price
					break
				}
			}
		}

		lineSubtotal := (menuItem.Price + extrasTotal) * float64(itemInput.Quantity)

		orderItems = append(orderItems, models.OrderItem{
			MenuItemID:          menuItem.ID,
			Name:                menuItem.Name,
			Price:               menuItem.Price,
			Quantity:            itemInput.Quantity,
			Extras:              validatedExtras,
			SpecialInstructions: itemInput.SpecialInstructions,
			Subtotal:            lineSubtotal,
		})
		subtotal += lineSubtotal
	}

	settings, err := s.settingsService.Get(ctx)
	if err != nil {
		return nil, err
	}

	orderNumber, err := utils.NextOrderNumber(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now()

	// Cash on Delivery starts unpaid (paid physically at delivery). Demo
	// Payment is a fully mocked flow with no real processor - the simulated
	// payment "succeeds" immediately at checkout.
	paymentStatus := models.PaymentStatusPending
	var paymentReference string
	var paidAt *time.Time
	if input.PaymentMethod == models.PaymentMethodDemo {
		paymentStatus = models.PaymentStatusPaid
		paymentReference = utils.NewDemoPaymentReference()
		paidAt = &now
	}

	order := models.Order{
		OrderNumber:         orderNumber,
		Customer:            input.Customer,
		Items:               orderItems,
		Subtotal:            subtotal,
		DeliveryFee:         settings.DeliveryFee,
		Discount:            0,
		Total:               subtotal + settings.DeliveryFee,
		DeliveryAddress:     input.DeliveryAddress,
		City:                input.City,
		Phone:               input.Phone,
		PaymentMethod:       input.PaymentMethod,
		PaymentStatus:       paymentStatus,
		PaymentReference:    paymentReference,
		PaidAt:              paidAt,
		OrderStatus:         models.StatusPending,
		SpecialInstructions: input.SpecialInstructions,
		CreatedAt:           now,
		UpdatedAt:           now,
	}

	res, err := s.collection().InsertOne(ctx, order)
	if err != nil {
		return nil, err
	}
	order.ID = res.InsertedID.(primitive.ObjectID)
	return &order, nil
}

func (s *OrderService) GetByOrderNumber(ctx context.Context, orderNumber string) (*models.Order, error) {
	var order models.Order
	err := s.collection().FindOne(ctx, bson.M{"orderNumber": orderNumber}).Decode(&order)
	if err == mongo.ErrNoDocuments {
		return nil, ErrNotFound
	} else if err != nil {
		return nil, err
	}
	return &order, nil
}

// OrderFilter captures optional filters for the admin order list.
type OrderFilter struct {
	Status string
}

func (s *OrderService) List(ctx context.Context, filter OrderFilter, pagination utils.PaginationParams) ([]models.Order, int64, error) {
	query := bson.M{}
	if filter.Status != "" {
		query["orderStatus"] = filter.Status
	}

	total, err := s.collection().CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, err
	}

	opts := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetSkip(pagination.Skip).
		SetLimit(pagination.Limit)

	cursor, err := s.collection().Find(ctx, query, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	orders := []models.Order{}
	if err := cursor.All(ctx, &orders); err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (s *OrderService) UpdateStatus(ctx context.Context, id string, status string) (*models.Order, error) {
	valid := false
	for _, validStatus := range models.ValidOrderStatuses {
		if validStatus == status {
			valid = true
			break
		}
	}
	if !valid {
		return nil, ErrInvalidStatus
	}

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidInput
	}

	var existing models.Order
	if err := s.collection().FindOne(ctx, bson.M{"_id": objID}).Decode(&existing); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNotFound
		}
		return nil, err
	}

	now := time.Now()
	update := bson.M{"orderStatus": status, "updatedAt": now}

	// Cash on Delivery is collected in person, so delivery is what marks it
	// Paid. A Demo Payment order is already Paid from checkout - never
	// overwrite its original paidAt/paymentStatus here.
	if status == models.StatusDelivered && existing.PaymentStatus != models.PaymentStatusPaid {
		update["paymentStatus"] = models.PaymentStatusPaid
		update["paidAt"] = now
	}

	result, err := s.collection().UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update})
	if err != nil {
		return nil, err
	}
	if result.MatchedCount == 0 {
		return nil, ErrNotFound
	}

	var order models.Order
	err = s.collection().FindOne(ctx, bson.M{"_id": objID}).Decode(&order)
	if err != nil {
		return nil, err
	}
	return &order, nil
}

// DashboardStats aggregates the figures shown on the admin dashboard.
type DashboardStats struct {
	TotalOrders     int64   `json:"totalOrders"`
	TodaysOrders    int64   `json:"todaysOrders"`
	Revenue         float64 `json:"revenue"`
	TodaysRevenue   float64 `json:"todaysRevenue"`
	PendingOrders   int64   `json:"pendingOrders"`
	CompletedOrders int64   `json:"completedOrders"`
}

func (s *OrderService) GetStats(ctx context.Context) (*DashboardStats, error) {
	startOfDay := time.Date(time.Now().Year(), time.Now().Month(), time.Now().Day(), 0, 0, 0, 0, time.Now().Location())

	totalOrders, err := s.collection().CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	todaysOrders, err := s.collection().CountDocuments(ctx, bson.M{"createdAt": bson.M{"$gte": startOfDay}})
	if err != nil {
		return nil, err
	}

	pendingOrders, err := s.collection().CountDocuments(ctx, bson.M{
		"orderStatus": bson.M{"$nin": []string{models.StatusDelivered, models.StatusCancelled}},
	})
	if err != nil {
		return nil, err
	}

	completedOrders, err := s.collection().CountDocuments(ctx, bson.M{"orderStatus": models.StatusDelivered})
	if err != nil {
		return nil, err
	}

	revenue, err := s.sumTotal(ctx, bson.M{"orderStatus": bson.M{"$ne": models.StatusCancelled}})
	if err != nil {
		return nil, err
	}

	todaysRevenue, err := s.sumTotal(ctx, bson.M{
		"orderStatus": bson.M{"$ne": models.StatusCancelled},
		"createdAt":   bson.M{"$gte": startOfDay},
	})
	if err != nil {
		return nil, err
	}

	return &DashboardStats{
		TotalOrders:     totalOrders,
		TodaysOrders:    todaysOrders,
		Revenue:         revenue,
		TodaysRevenue:   todaysRevenue,
		PendingOrders:   pendingOrders,
		CompletedOrders: completedOrders,
	}, nil
}

func (s *OrderService) sumTotal(ctx context.Context, match bson.M) (float64, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: match}},
		{{Key: "$group", Value: bson.M{"_id": nil, "total": bson.M{"$sum": "$total"}}}},
	}

	cursor, err := s.collection().Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cursor.Close(ctx)

	var result []struct {
		Total float64 `bson:"total"`
	}
	if err := cursor.All(ctx, &result); err != nil {
		return 0, err
	}
	if len(result) == 0 {
		return 0, nil
	}
	return result[0].Total, nil
}
