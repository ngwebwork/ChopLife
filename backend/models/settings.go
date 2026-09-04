package models

import "time"

// Settings is a singleton document holding restaurant-wide configuration
// that the admin can edit without a code deploy.
type Settings struct {
	ID             string    `bson:"_id" json:"id"`
	RestaurantName string    `bson:"restaurantName" json:"restaurantName"`
	Tagline        string    `bson:"tagline" json:"tagline"`
	Logo           string    `bson:"logo" json:"logo"`
	Phone          string    `bson:"phone" json:"phone"`
	WhatsApp       string    `bson:"whatsapp" json:"whatsapp"`
	Address        string    `bson:"address" json:"address"`
	OpeningHours   string    `bson:"openingHours" json:"openingHours"`
	DeliveryFee    float64   `bson:"deliveryFee" json:"deliveryFee"`
	MinimumOrder   float64   `bson:"minimumOrder" json:"minimumOrder"`
	Facebook       string    `bson:"facebook" json:"facebook"`
	Instagram      string    `bson:"instagram" json:"instagram"`
	Twitter        string    `bson:"twitter" json:"twitter"`
	UpdatedAt      time.Time `bson:"updatedAt" json:"updatedAt"`
}

// SettingsInput is the payload accepted when an admin updates settings.
type SettingsInput struct {
	RestaurantName string  `json:"restaurantName"`
	Tagline        string  `json:"tagline"`
	Logo           string  `json:"logo"`
	Phone          string  `json:"phone"`
	WhatsApp       string  `json:"whatsapp"`
	Address        string  `json:"address"`
	OpeningHours   string  `json:"openingHours"`
	DeliveryFee    float64 `json:"deliveryFee"`
	MinimumOrder   float64 `json:"minimumOrder"`
	Facebook       string  `json:"facebook"`
	Instagram      string  `json:"instagram"`
	Twitter        string  `json:"twitter"`
}

// SettingsDocID is the fixed document id for the singleton settings document.
const SettingsDocID = "restaurant_settings"
