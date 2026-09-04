package middleware

import (
	"net/http"
	"strings"

	"choplife-backend/models"
	"choplife-backend/utils"

	"github.com/gin-gonic/gin"
)

// RequireAuth validates the Bearer JWT on the request and attaches the
// resolved user identity to the Gin context for downstream handlers.
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			utils.Error(c, http.StatusUnauthorized, "Authentication required")
			return
		}

		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			utils.Error(c, http.StatusUnauthorized, "Invalid authorization header")
			return
		}

		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			utils.Error(c, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)
		c.Next()
	}
}

// RequireAdmin ensures the authenticated user holds the admin role. It must
// run after RequireAuth.
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists || role != models.RoleAdmin {
			utils.Error(c, http.StatusForbidden, "Admin access required")
			return
		}
		c.Next()
	}
}
