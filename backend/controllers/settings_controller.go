package controllers

import (
	"net/http"

	"choplife-backend/models"
	"choplife-backend/services"
	"choplife-backend/utils"

	"github.com/gin-gonic/gin"
)

type SettingsController struct {
	settingsService *services.SettingsService
}

func NewSettingsController() *SettingsController {
	return &SettingsController{settingsService: services.NewSettingsService()}
}

func (sc *SettingsController) Get(c *gin.Context) {
	settings, err := sc.settingsService.Get(c.Request.Context())
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Could not load restaurant settings")
		return
	}
	utils.Success(c, http.StatusOK, settings)
}

func (sc *SettingsController) Update(c *gin.Context) {
	var input models.SettingsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please provide valid settings")
		return
	}

	settings, err := sc.settingsService.Update(c.Request.Context(), input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Could not update settings")
		return
	}

	utils.SuccessWithMessage(c, http.StatusOK, "Settings updated", settings)
}
