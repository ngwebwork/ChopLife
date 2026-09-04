package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ensureIndexes creates the indexes required for query performance and
// uniqueness guarantees. It is safe to call on every startup - MongoDB
// no-ops when an equivalent index already exists.
func ensureIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	indexModels := map[string][]mongo.IndexModel{
		"users": {
			{Keys: bson.D{{Key: "email", Value: 1}}, Options: options.Index().SetUnique(true)},
		},
		"menu_items": {
			{Keys: bson.D{{Key: "categoryId", Value: 1}}},
			{Keys: bson.D{{Key: "available", Value: 1}}},
			{Keys: bson.D{{Key: "popular", Value: 1}}},
			{Keys: bson.D{{Key: "name", Value: "text"}, {Key: "description", Value: "text"}}},
		},
		"categories": {
			{Keys: bson.D{{Key: "name", Value: 1}}, Options: options.Index().SetUnique(true)},
		},
		"orders": {
			{Keys: bson.D{{Key: "orderNumber", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "orderStatus", Value: 1}}},
			{Keys: bson.D{{Key: "createdAt", Value: -1}}},
			{Keys: bson.D{{Key: "phone", Value: 1}}},
		},
	}

	for collName, models := range indexModels {
		_, err := Collection(collName).Indexes().CreateMany(ctx, models)
		if err != nil {
			log.Printf("warning: failed creating indexes for %s: %v", collName, err)
		}
	}
}
