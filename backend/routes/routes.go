package routes

import (
	"net/http"

	"choplife-backend/controllers"
	"choplife-backend/middleware"
	"choplife-backend/utils"

	"github.com/gin-gonic/gin"
)

// Setup wires every route to its controller, applying auth/admin middleware
// where the spec requires protection.
func Setup(router *gin.Engine) {
	authController := controllers.NewAuthController()
	menuController := controllers.NewMenuController()
	categoryController := controllers.NewCategoryController()
	orderController := controllers.NewOrderController()
	settingsController := controllers.NewSettingsController()

	router.GET("/health", func(c *gin.Context) {
		utils.Success(c, http.StatusOK, gin.H{"status": "ok"})
	})

	api := router.Group("/api")

	auth := api.Group("/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
		auth.GET("/me", middleware.RequireAuth(), authController.Me)
	}

	menu := api.Group("/menu")
	{
		menu.GET("", menuController.List)
		menu.GET("/:id", menuController.GetByID)
		menu.POST("", middleware.RequireAuth(), middleware.RequireAdmin(), menuController.Create)
		menu.PUT("/:id", middleware.RequireAuth(), middleware.RequireAdmin(), menuController.Update)
		menu.DELETE("/:id", middleware.RequireAuth(), middleware.RequireAdmin(), menuController.Delete)
	}

	categories := api.Group("/categories")
	{
		categories.GET("", categoryController.List)
		categories.POST("", middleware.RequireAuth(), middleware.RequireAdmin(), categoryController.Create)
		categories.PUT("/:id", middleware.RequireAuth(), middleware.RequireAdmin(), categoryController.Update)
		categories.DELETE("/:id", middleware.RequireAuth(), middleware.RequireAdmin(), categoryController.Delete)
	}

	orders := api.Group("/orders")
	{
		orders.POST("", orderController.Create)
		orders.GET("/stats", middleware.RequireAuth(), middleware.RequireAdmin(), orderController.Stats)
		orders.GET("/:orderNumber", orderController.GetByOrderNumber)
		orders.GET("", middleware.RequireAuth(), middleware.RequireAdmin(), orderController.List)
		orders.PUT("/:id/status", middleware.RequireAuth(), middleware.RequireAdmin(), orderController.UpdateStatus)
	}

	settings := api.Group("/settings")
	{
		settings.GET("", settingsController.Get)
		settings.PUT("", middleware.RequireAuth(), middleware.RequireAdmin(), settingsController.Update)
	}
}
