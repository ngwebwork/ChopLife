package database

import (
	"context"
	"log"
	"time"

	"choplife-backend/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var DB *mongo.Database

// Connect establishes the MongoDB connection and stores it for reuse across
// the application. It also verifies connectivity with a Ping and ensures
// indexes exist on the core collections.
func Connect(cfg *config.Config) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(cfg.MongoURI)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatalf("failed to connect to MongoDB: %v", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("failed to ping MongoDB: %v", err)
	}

	Client = client
	DB = client.Database(cfg.MongoDatabase)

	log.Printf("Connected to MongoDB database: %s", cfg.MongoDatabase)

	ensureIndexes()
}

// Collection is a convenience accessor for a named collection in the active database.
func Collection(name string) *mongo.Collection {
	return DB.Collection(name)
}

// Disconnect gracefully closes the MongoDB connection.
func Disconnect() {
	if Client == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := Client.Disconnect(ctx); err != nil {
		log.Printf("error disconnecting from MongoDB: %v", err)
	}
}
