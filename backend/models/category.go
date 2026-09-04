package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Category groups menu items (Rice, Swallow, Soups, Grills, Fast Food, Drinks, Desserts).
type Category struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	Image       string             `bson:"image" json:"image"`
	Active      bool               `bson:"active" json:"active"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// CategoryInput is the payload accepted for create/update requests.
type CategoryInput struct {
	Name        string `json:"name" binding:"required,min=2,max=60"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Active      *bool  `json:"active"`
}
