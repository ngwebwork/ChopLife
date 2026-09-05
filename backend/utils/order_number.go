package utils

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"
)

// maxOrderSuffix bounds the random suffix to 6 digits (000000-999999), e.g.
// CLK-2026-483920. It intentionally is NOT a sequential counter: order
// numbers are public (used for guest order tracking with no login), so a
// predictable/incrementing number would let anyone enumerate other
// customers' orders just by guessing nearby values.
var maxOrderSuffix = big.NewInt(1000000)

// RandomOrderNumber generates a candidate order number with a
// cryptographically random 6-digit suffix. Callers are responsible for
// verifying uniqueness (e.g. via a unique index + insert retry) since this
// function does not touch the database.
func RandomOrderNumber() (string, error) {
	n, err := rand.Int(rand.Reader, maxOrderSuffix)
	if err != nil {
		return "", err
	}
	year := time.Now().Year()
	return fmt.Sprintf("CLK-%d-%06d", year, n.Int64()), nil
}
