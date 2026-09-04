package utils

import (
	"context"
	"fmt"
	"time"

	"choplife-backend/database"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type counterDoc struct {
	ID  string `bson:"_id"`
	Seq int64  `bson:"seq"`
}

// NextOrderNumber atomically increments a per-year counter in MongoDB and
// formats it as "CLK-<year>-<6 digit sequence>", e.g. CLK-2026-000123.
func NextOrderNumber(ctx context.Context) (string, error) {
	year := time.Now().Year()
	counterID := fmt.Sprintf("order_%d", year)

	opts := options.FindOneAndUpdate().
		SetUpsert(true).
		SetReturnDocument(options.After)

	var doc counterDoc
	err := database.Collection("counters").FindOneAndUpdate(
		ctx,
		bson.M{"_id": counterID},
		bson.M{"$inc": bson.M{"seq": 1}},
		opts,
	).Decode(&doc)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("CLK-%d-%06d", year, doc.Seq), nil
}
