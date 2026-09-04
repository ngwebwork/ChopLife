package services

import (
	"context"
	"strings"
	"time"

	"choplife-backend/database"
	"choplife-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CategoryService struct{}

func NewCategoryService() *CategoryService {
	return &CategoryService{}
}

func (s *CategoryService) collection() *mongo.Collection {
	return database.Collection("categories")
}

func (s *CategoryService) List(ctx context.Context, activeOnly bool) ([]models.Category, error) {
	filter := bson.M{}
	if activeOnly {
		filter["active"] = true
	}

	cursor, err := s.collection().Find(ctx, filter, nil)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	categories := []models.Category{}
	if err := cursor.All(ctx, &categories); err != nil {
		return nil, err
	}
	return categories, nil
}

func (s *CategoryService) GetByID(ctx context.Context, id string) (*models.Category, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidInput
	}

	var category models.Category
	err = s.collection().FindOne(ctx, bson.M{"_id": objID}).Decode(&category)
	if err == mongo.ErrNoDocuments {
		return nil, ErrNotFound
	} else if err != nil {
		return nil, err
	}
	return &category, nil
}

func (s *CategoryService) Create(ctx context.Context, input models.CategoryInput) (*models.Category, error) {
	existing := s.collection().FindOne(ctx, bson.M{"name": bson.M{"$regex": "^" + regexEscape(input.Name) + "$", "$options": "i"}})
	if existing.Err() == nil {
		return nil, ErrDuplicate
	}

	active := true
	if input.Active != nil {
		active = *input.Active
	}

	now := time.Now()
	category := models.Category{
		Name:        strings.TrimSpace(input.Name),
		Description: input.Description,
		Image:       input.Image,
		Active:      active,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	res, err := s.collection().InsertOne(ctx, category)
	if err != nil {
		return nil, err
	}
	category.ID = res.InsertedID.(primitive.ObjectID)
	return &category, nil
}

func (s *CategoryService) Update(ctx context.Context, id string, input models.CategoryInput) (*models.Category, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidInput
	}

	update := bson.M{
		"name":        strings.TrimSpace(input.Name),
		"description": input.Description,
		"image":       input.Image,
		"updatedAt":   time.Now(),
	}
	if input.Active != nil {
		update["active"] = *input.Active
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

func (s *CategoryService) Delete(ctx context.Context, id string) error {
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

// regexEscape escapes regex metacharacters so category name lookups can't be
// abused to inject a broader pattern than intended.
func regexEscape(s string) string {
	replacer := strings.NewReplacer(
		"\\", "\\\\", ".", "\\.", "+", "\\+", "*", "\\*", "?", "\\?",
		"(", "\\(", ")", "\\)", "[", "\\[", "]", "\\]", "{", "\\{", "}", "\\}",
		"^", "\\^", "$", "\\$", "|", "\\|",
	)
	return replacer.Replace(s)
}
