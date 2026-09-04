package main

import (
	"log"

	"choplife-backend/config"
	"choplife-backend/database"
	"choplife-backend/middleware"
	"choplife-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	database.Connect(cfg)
	defer database.Disconnect()

	if cfg.Port == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(middleware.Recovery())
	router.Use(middleware.RequestLogger())
	router.Use(middleware.CORS(cfg))

	routes.Setup(router)

	log.Printf("ChopLife Kitchen API listening on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}
