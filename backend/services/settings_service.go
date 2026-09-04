package services

import (
	"context"
	"time"

	"choplife-backend/database"
	"choplife-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SettingsService struct{}

func NewSettingsService() *SettingsService {
	return &SettingsService{}
}

func (s *SettingsService) collection() *mongo.Collection {
	return database.Collection("settings")
}

// defaultSettings is returned/inserted the very first time the app runs,
// before an admin has customized anything via /admin/settings.
func defaultSettings() models.Settings {
	return models.Settings{
		ID:             models.SettingsDocID,
		RestaurantName: "ChopLife Kitchen",
		Tagline:        "Fresh meals. Fast delivery. No stress.",
		Logo:           "",
		Phone:          "",
		WhatsApp:       "",
		Address:        "Lagos, Nigeria",
		OpeningHours:   "Mon - Sun: 9:00 AM - 10:00 PM",
		DeliveryFee:    1500,
		MinimumOrder:   2000,
		UpdatedAt:      time.Now(),
	}
}

// Get returns the singleton settings document, creating it with sane
// defaults on first access.
func (s *SettingsService) Get(ctx context.Context) (*models.Settings, error) {
	var settings models.Settings
	err := s.collection().FindOne(ctx, bson.M{"_id": models.SettingsDocID}).Decode(&settings)
	if err == mongo.ErrNoDocuments {
		defaults := defaultSettings()
		_, insertErr := s.collection().InsertOne(ctx, defaults)
		if insertErr != nil {
			return nil, insertErr
		}
		return &defaults, nil
	} else if err != nil {
		return nil, err
	}
	return &settings, nil
}

func (s *SettingsService) Update(ctx context.Context, input models.SettingsInput) (*models.Settings, error) {
	update := bson.M{
		"restaurantName": input.RestaurantName,
		"tagline":        input.Tagline,
		"logo":           input.Logo,
		"phone":          input.Phone,
		"whatsapp":       input.WhatsApp,
		"address":        input.Address,
		"openingHours":   input.OpeningHours,
		"deliveryFee":    input.DeliveryFee,
		"minimumOrder":   input.MinimumOrder,
		"facebook":       input.Facebook,
		"instagram":      input.Instagram,
		"twitter":        input.Twitter,
		"updatedAt":      time.Now(),
	}

	opts := options.Update().SetUpsert(true)
	_, err := s.collection().UpdateOne(ctx, bson.M{"_id": models.SettingsDocID}, bson.M{"$set": update}, opts)
	if err != nil {
		return nil, err
	}

	return s.Get(ctx)
}
