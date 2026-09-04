package services

import (
	"context"
	"strings"
	"time"

	"choplife-backend/database"
	"choplife-backend/models"
	"choplife-backend/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) usersCollection() *mongo.Collection {
	return database.Collection("users")
}

// Register creates a new admin account and returns the created user plus a
// signed JWT so the caller is immediately logged in.
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
	user.ID = res.InsertedID.(primitive.ObjectID)

	token, err := utils.GenerateToken(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		return nil, "", err
	}

	return &user, token, nil
}

// Login verifies credentials and returns the user plus a signed JWT.
func (s *AuthService) Login(ctx context.Context, email, password string) (*models.User, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	var user models.User
	err := s.usersCollection().FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, "", ErrUnauthorized
	}

	if !utils.CheckPassword(user.Password, password) {
		return nil, "", ErrUnauthorized
	}

	token, err := utils.GenerateToken(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		return nil, "", err
	}

	return &user, token, nil
}
