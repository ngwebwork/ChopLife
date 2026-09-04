package controllers

import (
	"net/http"

	"choplife-backend/models"
	"choplife-backend/services"
	"choplife-backend/utils"

	"github.com/gin-gonic/gin"
)

type CategoryController struct {
	categoryService *services.CategoryService
}

func NewCategoryController() *CategoryController {
	return &CategoryController{categoryService: services.NewCategoryService()}
}

func (cc *CategoryController) List(c *gin.Context) {
	activeOnly := c.Query("active") == "true"
	categories, err := cc.categoryService.List(c.Request.Context(), activeOnly)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Could not load categories")
		return
	}
	utils.Success(c, http.StatusOK, categories)
}

func (cc *CategoryController) Create(c *gin.Context) {
	var input models.CategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please provide a valid category name")
		return
	}

	category, err := cc.categoryService.Create(c.Request.Context(), input)
	if err != nil {
		if err == services.ErrDuplicate {
			utils.Error(c, http.StatusConflict, "A category with this name already exists")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "Could not create category")
		return
	}

	utils.SuccessWithMessage(c, http.StatusCreated, "Category created", category)
}

func (cc *CategoryController) Update(c *gin.Context) {
	var input models.CategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please provide a valid category name")
		return
	}

	category, err := cc.categoryService.Update(c.Request.Context(), c.Param("id"), input)
	if err != nil {
		cc.handleFetchError(c, err)
		return
	}

	utils.SuccessWithMessage(c, http.StatusOK, "Category updated", category)
}

func (cc *CategoryController) Delete(c *gin.Context) {
	err := cc.categoryService.Delete(c.Request.Context(), c.Param("id"))
	if err != nil {
		cc.handleFetchError(c, err)
		return
	}
	utils.SuccessWithMessage(c, http.StatusOK, "Category deleted", nil)
}

func (cc *CategoryController) handleFetchError(c *gin.Context, err error) {
	switch err {
	case services.ErrNotFound:
		utils.Error(c, http.StatusNotFound, "Category not found")
	case services.ErrInvalidInput:
		utils.Error(c, http.StatusBadRequest, "Invalid request")
	default:
		utils.Error(c, http.StatusInternalServerError, "Something went wrong")
	}
}
