package middleware

import (
	"time"

	"choplife-backend/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORS configures cross-origin access scoped to the configured client URL
// rather than a permissive wildcard, since the API accepts credentials-free
// bearer auth but should still not be open to arbitrary origins.
func CORS(cfg *config.Config) gin.HandlerFunc {
	allowedOrigins := []string{cfg.ClientURL}

	return cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
