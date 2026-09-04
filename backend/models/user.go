package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	RoleAdmin = "admin"
)

// User represents an administrator account. Customers order as guests and
// do not have accounts in the MVP.
type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name      string             `bson:"name" json:"name"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password" json:"-"`
	Role      string             `bson:"role" json:"role"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}
