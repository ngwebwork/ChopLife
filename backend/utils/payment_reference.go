package utils

import (
	"crypto/rand"
	"encoding/hex"
)

// NewDemoPaymentReference generates a reference string for a simulated
// "Demo Payment" order. This is never sent to, or verified against, any
// real payment processor - it exists purely to give the mocked payment a
// realistic-looking reference number.
func NewDemoPaymentReference() string {
	buf := make([]byte, 5)
	if _, err := rand.Read(buf); err != nil {
		return "DEMO-000000"
	}
	return "DEMO-" + hex.EncodeToString(buf)
}
