package middleware

import (
	"log"
	"net/http"

	"choplife-backend/utils"

	"github.com/gin-gonic/gin"
)

// Recovery catches panics anywhere in the handler chain, logs the real
// error server-side, and returns a generic message to the client so
// internal details/stack traces are never exposed.
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("panic recovered: %v", r)
				utils.Error(c, http.StatusInternalServerError, "Something went wrong. Please try again.")
			}
		}()
		c.Next()
	}
}

// RequestLogger logs each request method, path, status and latency.
func RequestLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return param.TimeStamp.Format("2006/01/02 15:04:05") + " | " +
			param.Method + " " + param.Path + " | " +
			http.StatusText(param.StatusCode) + " | " +
			param.Latency.String() + "\n"
	})
}
