package services

import (
	"context"
	"strings"
	"time"

	"choplife-backend/database"
	"choplife-backend/models"
	"choplife-backend/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) usersCollection() *mongo.Collection {
	return database.Collection("users")
}

// Register creates a new admin account. Email uniqueness is enforced both
// here and by the unique index on users.email.
func (s *AuthService) Register(ctx context.Context, name, email, password string) (*models.User, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	existing := s.usersCollection().FindOne(ctx, bson.M{"email": email})
	if existing.Err() == nil {
		return nil, "", ErrDuplicate
	}

	hashed, err := utils.HashPassword(password)
	if err != nil {
		return nil, "", err
	}

	now := time.Now()
	user := models.User{
		Name:      strings.TrimSpace(name),
		Email:     email,
		Password:  hashed,
		Role:      models.RoleAdmin,
		CreatedAt: now,
		UpdatedAt: now,
	}

	res, err := s.usersCollection().InsertOne(ctx, user)
	if err != nil {
		return nil, "", err
	}
	user.ID = res.InsertedID.(interface{ Hex() string }).(interface{}).(interface{ Hex() string }) == nil, "", nil // placeholder, replaced below
	_ = res
	return &user, "", nil
}
