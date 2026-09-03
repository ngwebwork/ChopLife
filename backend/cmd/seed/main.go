// Command seed populates MongoDB with realistic ChopLife Kitchen sample data:
// categories, menu items, restaurant settings and a default admin account.
// Run with: go run ./cmd/seed
package main

import (
	"context"
	"log"
	"time"

	"choplife-backend/config"
	"choplife-backend/database"
	"choplife-backend/models"
	"choplife-backend/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// wikimediaImage builds a stable, hotlink-safe URL to a real photo hosted on
// Wikimedia Commons via its Special:FilePath redirect. Using real Commons
// file names (verified against their actual content) instead of generated
// placeholder graphics means every menu card shows an authentic food photo.
func wikimediaImage(fileName string) string {
	return "https://commons.wikimedia.org/wiki/Special:FilePath/" + fileName + "?width=800"
}

func main() {
	cfg := config.Load()
	database.Connect(cfg)
	defer database.Disconnect()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	categoryIDs := seedCategories(ctx)
	seedMenuItems(ctx, categoryIDs)
	seedSettings(ctx)
	seedAdmin(ctx)

	log.Println("Seeding complete.")
}

func seedCategories(ctx context.Context) map[string]primitive.ObjectID {
	collection := database.Collection("categories")

	names := []struct {
		Name  string
		Desc  string
		Image string
	}{
		{"Rice", "Perfectly seasoned rice dishes", wikimediaImage("A_tray_of_jollof_rice,_chicken_with_soft_drink.jpg")},
		{"Swallow", "Traditional Nigerian swallows and soups", wikimediaImage("Pounded_Yam_and_Egusi_Soup.jpg")},
		{"Soups", "Rich, hearty Nigerian soups", wikimediaImage("Ogbono_Soup_served_with_eba.jpg")},
		{"Grills", "Smoky grilled meats and suya", wikimediaImage("Grilled_Chicken_Breasts_(28905381261).jpg")},
		{"Fast Food", "Quick bites and continental favorites", wikimediaImage("In-N-Out_Burger_cheeseburger_and_fries.jpg")},
		{"Drinks", "Chilled and refreshing beverages", wikimediaImage("Chapman_in_a_punch_bowl.jpg")},
		{"Desserts", "Sweet treats to finish your meal", wikimediaImage("Meat_pie.jpg")},
	}

	ids := make(map[string]primitive.ObjectID)
	now := time.Now()

	for _, n := range names {
		filter := bson.M{"name": n.Name}
		update := bson.M{
			"$set": bson.M{
				"image": n.Image,
			},
			"$setOnInsert": bson.M{
				"name":        n.Name,
				"description": n.Desc,
				"active":      true,
				"createdAt":   now,
				"updatedAt":   now,
			},
		}
		opts := options.Update().SetUpsert(true)
		res, err := collection.UpdateOne(ctx, filter, update, opts)
		if err != nil {
			log.Fatalf("failed to seed category %s: %v", n.Name, err)
		}

		var category models.Category
		if res.UpsertedID != nil {
			ids[n.Name] = res.UpsertedID.(primitive.ObjectID)
		} else {
			if err := collection.FindOne(ctx, filter).Decode(&category); err != nil {
				log.Fatalf("failed to fetch seeded category %s: %v", n.Name, err)
			}
			ids[n.Name] = category.ID
		}
	}

	log.Printf("Seeded %d categories", len(ids))
	return ids
}

type menuSeed struct {
	Name        string
	Description string
	Price       float64
	Category    string
	Image       string
	Ingredients []string
	Extras      []models.Extra
	Popular     bool
	Rating      float64
}

func seedMenuItems(ctx context.Context, categoryIDs map[string]primitive.ObjectID) {
	collection := database.Collection("menu_items")

	items := []menuSeed{
		{
			Name: "Jollof Rice & Chicken", Category: "Rice", Price: 5500,
			Image:       wikimediaImage("A_tray_of_jollof_rice,_chicken_with_soft_drink.jpg"),
			Description: "Smoky party-style jollof rice served with grilled chicken.",
			Ingredients: []string{"Rice", "Tomato Stew", "Chicken", "Spices"},
			Extras: []models.Extra{
				{Name: "Extra Chicken", Price: 2000},
				{Name: "Fried Plantain", Price: 1000},
				{Name: "Coleslaw", Price: 800},
			},
			Popular: true, Rating: 4.8,
		},
		{
			Name: "Fried Rice & Chicken", Category: "Rice", Price: 5500,
			Image:       wikimediaImage("Ghanaian_Fried_Rice_%26_Chicken.jpg"),
			Description: "Colorful fried rice loaded with vegetables and served with chicken.",
			Ingredients: []string{"Rice", "Mixed Vegetables", "Liver", "Chicken"},
			Extras: []models.Extra{
				{Name: "Extra Chicken", Price: 2000},
				{Name: "Fried Plantain", Price: 1000},
			},
			Popular: true, Rating: 4.6,
		},
		{
			Name: "Pounded Yam & Egusi", Category: "Swallow", Price: 4500,
			Image:       wikimediaImage("Pounded_Yam_and_Egusi_Soup.jpg"),
			Description: "Smooth pounded yam served with rich egusi soup and assorted meat.",
			Ingredients: []string{"Yam", "Egusi", "Assorted Meat", "Spinach"},
			Extras: []models.Extra{
				{Name: "Extra Meat", Price: 1500},
				{Name: "Stockfish", Price: 1200},
			},
			Popular: true, Rating: 4.7,
		},
		{
			Name: "Eba & Okro Soup", Category: "Swallow", Price: 4000,
			Image:       wikimediaImage("Ogbono_Soup_served_with_eba.jpg"),
			Description: "Classic eba paired with draw-worthy okro soup and fish.",
			Ingredients: []string{"Garri", "Okro", "Fish", "Palm Oil"},
			Extras: []models.Extra{
				{Name: "Extra Fish", Price: 1500},
			},
			Rating: 4.4,
		},
		{
			Name: "Ofada Rice & Ayamase Sauce", Category: "Soups", Price: 5000,
			Image:       wikimediaImage("Rice_and_Ayamase_sauce.jpg"),
			Description: "Local ofada rice with spicy ayamase (designer) stew and assorted meat.",
			Ingredients: []string{"Ofada Rice", "Green Pepper", "Assorted Meat"},
			Extras:      []models.Extra{{Name: "Extra Meat", Price: 1500}},
			Rating:      4.5,
		},
		{
			Name: "Grilled Chicken", Category: "Grills", Price: 4800,
			Image:       wikimediaImage("Grilled_Chicken_Breasts_(28905381261).jpg"),
			Description: "Char-grilled chicken marinated in Nigerian spices, served with sides.",
			Ingredients: []string{"Chicken", "Pepper Sauce", "Herbs"},
			Extras: []models.Extra{
				{Name: "Extra Sauce", Price: 500},
				{Name: "Fried Plantain", Price: 1000},
			},
			Popular: true, Rating: 4.9,
		},
		{
			Name: "Beef Suya", Category: "Grills", Price: 3500,
			Image:       wikimediaImage("Suya_seller_in_Nigeria.jpg"),
			Description: "Skewered beef suya coated in spicy yaji pepper mix.",
			Ingredients: []string{"Beef", "Suya Spice", "Onions"},
			Extras:      []models.Extra{{Name: "Extra Spice", Price: 300}},
			Popular:     true, Rating: 4.7,
		},
		{
			Name: "Shawarma", Category: "Fast Food", Price: 3000,
			Image:       wikimediaImage("Shawarma_2.jpg"),
			Description: "Loaded chicken shawarma wrap with sauces and fresh vegetables.",
			Ingredients: []string{"Chicken", "Tortilla Wrap", "Sauces", "Vegetables"},
			Extras:      []models.Extra{{Name: "Extra Chicken", Price: 1000}},
			Popular:     true, Rating: 4.6,
		},
		{
			Name: "Burger", Category: "Fast Food", Price: 3500,
			Image:       wikimediaImage("In-N-Out_Burger_cheeseburger_and_fries.jpg"),
			Description: "Juicy beef burger with cheese, lettuce and our special sauce.",
			Ingredients: []string{"Beef Patty", "Cheese", "Lettuce", "Bun"},
			Extras:      []models.Extra{{Name: "Extra Cheese", Price: 500}},
			Rating:      4.3,
		},
		{
			Name: "Fried Plantain (Dodo)", Category: "Fast Food", Price: 1500,
			Image:       wikimediaImage("Un_plat_d%27alloco_Fried_Plantains.JPG"),
			Description: "Sweet, golden fried plantain slices.",
			Ingredients: []string{"Plantain", "Vegetable Oil"},
			Rating:      4.5,
		},
		{
			Name: "Chapman", Category: "Drinks", Price: 2000,
			Image:       wikimediaImage("Chapman_in_a_punch_bowl.jpg"),
			Description: "Nigeria's favorite fruity mocktail, chilled and refreshing.",
			Ingredients: []string{"Grenadine", "Fruit Juice", "Soda", "Cucumber"},
			Rating:      4.6,
		},
		{
			Name: "Zobo", Category: "Drinks", Price: 1200,
			Image:       wikimediaImage("Zobo_drink_(hibiscus_juice)_01.png"),
			Description: "Hibiscus flower drink infused with ginger, pineapple and spices.",
			Ingredients: []string{"Hibiscus Leaves", "Ginger", "Pineapple"},
			Rating:      4.4,
		},
		{
			Name: "Meat Pie", Category: "Desserts", Price: 1000,
			Image:       wikimediaImage("Meat_pie.jpg"),
			Description: "Flaky pastry filled with seasoned minced meat and vegetables.",
			Ingredients: []string{"Pastry", "Minced Meat", "Carrots", "Potatoes"},
			Rating:      4.5,
		},
	}

	now := time.Now()
	seeded := 0

	for _, item := range items {
		categoryID, ok := categoryIDs[item.Category]
		if !ok {
			log.Printf("skipping %s: unknown category %s", item.Name, item.Category)
			continue
		}

		filter := bson.M{"name": item.Name}
		update := bson.M{
			"$set": bson.M{
				"image": item.Image,
			},
			"$setOnInsert": bson.M{
				"name":        item.Name,
				"description": item.Description,
				"price":       item.Price,
				"categoryId":  categoryID,
				"ingredients": item.Ingredients,
				"extras":      nonNilExtras(item.Extras),
				"available":   true,
				"popular":     item.Popular,
				"rating":      item.Rating,
				"createdAt":   now,
				"updatedAt":   now,
			},
		}
		opts := options.Update().SetUpsert(true)
		if _, err := collection.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Fatalf("failed to seed menu item %s: %v", item.Name, err)
		}
		seeded++
	}

	log.Printf("Seeded %d menu items", seeded)
}

func nonNilExtras(e []models.Extra) []models.Extra {
	if e == nil {
		return []models.Extra{}
	}
	return e
}

func seedSettings(ctx context.Context) {
	collection := database.Collection("settings")

	filter := bson.M{"_id": models.SettingsDocID}
	update := bson.M{
		"$setOnInsert": bson.M{
			"_id":            models.SettingsDocID,
			"restaurantName": "ChopLife Kitchen",
			"tagline":        "Fresh meals. Fast delivery. No stress.",
			"logo":           "",
			"phone":          "+2348012345678",
			"whatsapp":       "2348012345678",
			"address":        "12 Admiralty Way, Lekki Phase 1, Lagos",
			"openingHours":   "Mon - Sun: 9:00 AM - 10:00 PM",
			"deliveryFee":    1500,
			"minimumOrder":   2000,
			"facebook":       "https://facebook.com/choplifekitchen",
			"instagram":      "https://instagram.com/choplifekitchen",
			"twitter":        "https://twitter.com/choplifekitchen",
			"updatedAt":      time.Now(),
		},
	}
	opts := options.Update().SetUpsert(true)
	if _, err := collection.UpdateOne(ctx, filter, update, opts); err != nil {
		log.Fatalf("failed to seed settings: %v", err)
	}
	log.Println("Seeded restaurant settings")
}

func seedAdmin(ctx context.Context) {
	collection := database.Collection("users")

	email := "admin@choplife.com"
	var existing models.User
	err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&existing)
	if err == nil {
		log.Println("Admin account already exists, skipping")
		return
	}

	hashed, err := utils.HashPassword("Admin@123")
	if err != nil {
		log.Fatalf("failed to hash admin password: %v", err)
	}

	now := time.Now()
	user := models.User{
		Name:      "ChopLife Admin",
		Email:     email,
		Password:  hashed,
		Role:      models.RoleAdmin,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if _, err := collection.InsertOne(ctx, user); err != nil {
		log.Fatalf("failed to seed admin: %v", err)
	}

	log.Println("Seeded default admin account:")
	log.Println("   Email:    admin@choplife.com")
	log.Println("   Password: Admin@123")
	log.Println("   IMPORTANT: change this password after first login.")
}
