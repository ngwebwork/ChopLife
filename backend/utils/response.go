package utils

import "github.com/gin-gonic/gin"

// APIResponse is the consistent success/error envelope used by every endpoint.
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

// Success sends a 2xx JSON response wrapping data in the standard envelope.
func Success(c *gin.Context, status int, data interface{}) {
	c.JSON(status, APIResponse{Success: true, Data: data})
}

// SuccessWithMessage sends a success response that also carries a human message.
func SuccessWithMessage(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, APIResponse{Success: true, Data: data, Message: message})
}

// Error sends a failure response. Internal error details are never included -
// callers should log those server-side and pass only a safe message here.
func Error(c *gin.Context, status int, message string) {
	c.AbortWithStatusJSON(status, APIResponse{Success: false, Message: message})
}
