package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Order status lifecycle.
const (
	StatusPending        = "Pending"
	StatusConfirmed      = "Confirmed"
	StatusPreparing      = "Preparing"
	StatusReady          = "Ready"
	StatusOutForDelivery = "Out for Delivery"
	StatusDelivered      = "Delivered"
	StatusCancelled      = "Cancelled"
)

// ValidOrderStatuses lists every status an admin may transition an order to.
var ValidOrderStatuses = []string{
	StatusPending, StatusConfirmed, StatusPreparing, StatusReady,
	StatusOutForDelivery, StatusDelivered, StatusCancelled,
}

// Payment methods and statuses.
const (
	PaymentMethodCOD    = "Cash on Delivery"
	PaymentMethodOnline = "Online Payment"

	PaymentStatusPending  = "Pending"
	PaymentStatusPaid     = "Paid"
	PaymentStatusFailed   = "Failed"
	PaymentStatusRefunded = "Refunded"
)

// Customer holds the guest checkout details captured on an order.
type Customer struct {
	Name  string `bson:"name" json:"name"`
	Phone string `bson:"phone" json:"phone"`
	Email string `bson:"email" json:"email"`
}

// OrderItem is a line item snapshot - prices are captured at order time so
// later menu price changes never retroactively alter historical orders.
type OrderItem struct {
	MenuItemID          primitive.ObjectID `bson:"menuItemId" json:"menuItemId"`
	Name                string             `bson:"name" json:"name"`
	Price               float64            `bson:"price" json:"price"`
	Quantity            int                `bson:"quantity" json:"quantity"`
	Extras              []Extra            `bson:"extras" json:"extras"`
	SpecialInstructions string             `bson:"specialInstructions" json:"specialInstructions"`
	Subtotal            float64            `bson:"subtotal" json:"subtotal"`
}

// Order represents a single customer order end-to-end.
type Order struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	OrderNumber         string             `bson:"orderNumber" json:"orderNumber"`
	Customer            Customer           `bson:"customer" json:"customer"`
	Items               []OrderItem        `bson:"items" json:"items"`
	Subtotal            float64            `bson:"subtotal" json:"subtotal"`
	DeliveryFee         float64            `bson:"deliveryFee" json:"deliveryFee"`
	Discount            float64            `bson:"discount" json:"discount"`
	Total               float64            `bson:"total" json:"total"`
	DeliveryAddress     string             `bson:"deliveryAddress" json:"deliveryAddress"`
	City                string             `bson:"city" json:"city"`
	Phone               string             `bson:"phone" json:"phone"`
	PaymentMethod       string             `bson:"paymentMethod" json:"paymentMethod"`
	PaymentStatus       string             `bson:"paymentStatus" json:"paymentStatus"`
	PaymentReference    string             `bson:"paymentReference,omitempty" json:"paymentReference,omitempty"`
	OrderStatus         string             `bson:"orderStatus" json:"orderStatus"`
	SpecialInstructions string             `bson:"specialInstructions" json:"specialInstructions"`
	CreatedAt           time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt           time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// OrderItemInput is what the client sends per line item - the server looks
// up the authoritative price from the menu_items collection rather than
// trusting any price supplied by the client.
type OrderItemInput struct {
	MenuItemID          string  `json:"menuItemId" binding:"required"`
	Quantity            int     `json:"quantity" binding:"required,gt=0"`
	Extras              []Extra `json:"extras"`
	SpecialInstructions string  `json:"specialInstructions"`
}

// CreateOrderInput is the full checkout payload.
type CreateOrderInput struct {
	Customer            Customer         `json:"customer" binding:"required"`
	Items               []OrderItemInput `json:"items" binding:"required,min=1,dive"`
	DeliveryAddress     string           `json:"deliveryAddress" binding:"required"`
	City                string           `json:"city" binding:"required"`
	Phone               string           `json:"phone" binding:"required"`
	PaymentMethod       string           `json:"paymentMethod" binding:"required"`
	SpecialInstructions string           `json:"specialInstructions"`
}

// UpdateOrderStatusInput is used by admins to move an order through its lifecycle.
type UpdateOrderStatusInput struct {
	OrderStatus string `json:"orderStatus" binding:"required"`
}
