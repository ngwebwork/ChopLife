package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Extra is an optional add-on for a menu item (e.g. "Extra Chicken +₦2,000").
type Extra struct {
	Name  string  `bson:"name" json:"name"`
	Price float64 `bson:"price" json:"price"`
}

// MenuItem represents a single dish available for order.
type MenuItem struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string             `bson:"name" json:"name"`
	Description  string             `bson:"description" json:"description"`
	Price        float64            `bson:"price" json:"price"`
	CategoryID   primitive.ObjectID `bson:"categoryId" json:"categoryId"`
	CategoryName string             `bson:"-" json:"categoryName,omitempty"`
	Image        string             `bson:"image" json:"image"`
	Ingredients  []string           `bson:"ingredients" json:"ingredients"`
	Extras       []Extra            `bson:"extras" json:"extras"`
	Available    bool               `bson:"available" json:"available"`
	Popular      bool               `bson:"popular" json:"popular"`
	Rating       float64            `bson:"rating" json:"rating"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// MenuItemInput is the payload accepted for create/update requests.
type MenuItemInput struct {
	Name        string   `json:"name" binding:"required,min=2,max=100"`
	Description string   `json:"description"`
	Price       float64  `json:"price" binding:"required,gt=0"`
	CategoryID  string   `json:"categoryId" binding:"required"`
	Image       string   `json:"image"`
	Ingredients []string `json:"ingredients"`
	Extras      []Extra  `json:"extras"`
	Available   *bool    `json:"available"`
	Popular     *bool    `json:"popular"`
	Rating      float64  `json:"rating"`
}
