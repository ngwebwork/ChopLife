package controllers

import (
	"net/http"

	"choplife-backend/config"
	"choplife-backend/services"
	"choplife-backend/utils"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService *services.AuthService
}

func NewAuthController() *AuthController {
	return &AuthController{authService: services.NewAuthService()}
}

type registerRequest struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// Register creates a new admin account. Disabled by default - only an
// existing admin should be able to log in. Set ALLOW_ADMIN_REGISTRATION=true
// in the environment to re-enable it (e.g. temporarily, for onboarding a new
// admin), then turn it back off.
func (ac *AuthController) Register(c *gin.Context) {
	if !config.App.AllowAdminRegistration {
		utils.Error(c, http.StatusForbidden, "Admin registration is currently disabled")
		return
	}

	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please provide a valid name, email and password (min 6 characters)")
		return
	}

	user, token, err := ac.authService.Register(c.Request.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		if err == services.ErrDuplicate {
			utils.Error(c, http.StatusConflict, "An account with this email already exists")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "Could not create account")
		return
	}

	utils.SuccessWithMessage(c, http.StatusCreated, "Account created successfully", gin.H{
		"token": token,
		"user":  user,
	})
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (ac *AuthController) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please provide a valid email and password")
		return
	}

	user, token, err := ac.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	utils.SuccessWithMessage(c, http.StatusOK, "Login successful", gin.H{
		"token": token,
		"user":  user,
	})
}

// Me returns the currently authenticated admin's identity, used by the
// frontend to restore a session from a stored token on page load.
func (ac *AuthController) Me(c *gin.Context) {
	userID, _ := c.Get("userID")
	email, _ := c.Get("userEmail")
	role, _ := c.Get("userRole")

	utils.Success(c, http.StatusOK, gin.H{
		"id":    userID,
		"email": email,
		"role":  role,
	})
}
