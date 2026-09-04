package services

import (
	"context"
	"time"

	"choplife-backend/database"
	"choplife-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MenuService struct{}

func NewMenuService() *MenuService {
	return &MenuService{}
}

func (s *MenuService) collection() *mongo.Collection {
	return database.Collection("menu_items")
}

// MenuFilter captures the optional query params supported by GET /api/menu.
type MenuFilter struct {
	CategoryID string
	Search     string
	Popular    *bool
	Available  *bool
}

func (s *MenuService) List(ctx context.Context, filter MenuFilter) ([]models.MenuItem, error) {
	query := bson.M{}

	if filter.CategoryID != "" {
		catID, err := primitive.ObjectIDFromHex(filter.CategoryID)
		if err != nil {
			return nil, ErrInvalidInput
		}
		query["categoryId"] = catID
	}
	if filter.Popular != nil {
		query["popular"] = *filter.Popular
	}
	if filter.Available != nil {
		query["available"] = *filter.Available
	}
	if filter.Search != "" {
		query["$or"] = []bson.M{
			{"name": bson.M{"$regex": filter.Search, "$options": "i"}},
			{"description": bson.M{"$regex": filter.Search, "$options": "i"}},
		}
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := s.collection().Find(ctx, query, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	items := []models.MenuItem{}
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (s *MenuService) GetByID(ctx context.Context, id string) (*models.MenuItem, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidInput
	}

	var item models.MenuItem
	err = s.collection().FindOne(ctx, bson.M{"_id": objID}).Decode(&item)
	if err == mongo.ErrNoDocuments {
		return nil, ErrNotFound
	} else if err != nil {
		return nil, err
	}
	return &item, nil
}

// GetManyByIDs is used by the order service to fetch authoritative prices
// for a set of menu items in a single round trip.
func (s *MenuService) GetManyByIDs(ctx context.Context, ids []primitive.ObjectID) (map[primitive.ObjectID]models.MenuItem, error) {
	cursor, err := s.collection().Find(ctx, bson.M{"_id": bson.M{"$in": ids}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	items := []models.MenuItem{}
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}

	result := make(map[primitive.ObjectID]models.MenuItem, len(items))
	for _, item := range items {
		result[item.ID] = item
	}
	return result, nil
}

func (s *MenuService) Create(ctx context.Context, input models.MenuItemInput) (*models.MenuItem, error) {
	categoryID, err := primitive.ObjectIDFromHex(input.CategoryID)
	if err != nil {
		return nil, ErrInvalidInput
	}

	available := true
	if input.Available != nil {
		available = *input.Available
	}
	popular := false
	if input.Popular != nil {
		popular = *input.Popular
	}

	now := time.Now()
	item := models.MenuItem{
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		CategoryID:  categoryID,
		Image:       input.Image,
		Ingredients: nonNilStrings(input.Ingredients),
		Extras:      nonNilExtras(input.Extras),
		Available:   available,
		Popular:     popular,
		Rating:      input.Rating,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	res, err := s.collection().InsertOne(ctx, item)
	if err != nil {
		return nil, err
	}
	item.ID = res.InsertedID.(primitive.ObjectID)
	return &item, nil
}

func (s *MenuService) Update(ctx context.Context, id string, input models.MenuItemInput) (*models.MenuItem, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidInput
	}
	categoryID, err := primitive.ObjectIDFromHex(input.CategoryID)
	if err != nil {
		return nil, ErrInvalidInput
	}

	update := bson.M{
		"name":        input.Name,
		"description": input.Description,
		"price":       input.Price,
		"categoryId":  categoryID,
		"image":       input.Image,
		"ingredients": nonNilStrings(input.Ingredients),
		"extras":      nonNilExtras(input.Extras),
		"rating":      input.Rating,
		"updatedAt":   time.Now(),
	}
	if input.Available != nil {
		update["available"] = *input.Available
	}
	if input.Popular != nil {
		update["popular"] = *input.Popular
	}

	result, err := s.collection().UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update})
	if err != nil {
		return nil, err
	}
	if result.MatchedCount == 0 {
		return nil, ErrNotFound
	}

	return s.GetByID(ctx, id)
}

func (s *MenuService) Delete(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return ErrInvalidInput
	}

	result, err := s.collection().DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return ErrNotFound
	}
	return nil
}

func nonNilStrings(s []string) []string {
	if s == nil {
		return []string{}
	}
	return s
}

func nonNilExtras(e []models.Extra) []models.Extra {
	if e == nil {
		return []models.Extra{}
	}
	return e
}
