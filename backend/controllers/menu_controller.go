package controllers

import (
	"net/http"

	"choplife-backend/models"
	"choplife-backend/services"
	"choplife-backend/utils"

	"github.com/gin-gonic/gin"
)

type MenuController struct {
	menuService     *services.MenuService
	categoryService *services.CategoryService
}

func NewMenuController() *MenuController {
	return &MenuController{
		menuService:     services.NewMenuService(),
		categoryService: services.NewCategoryService(),
	}
}

func (mc *MenuController) List(c *gin.Context) {
	filter := services.MenuFilter{
		CategoryID: c.Query("category"),
		Search:     c.Query("search"),
	}
	if popular := c.Query("popular"); popular != "" {
		v := popular == "true"
		filter.Popular = &v
	}
	if available := c.Query("available"); available != "" {
		v := available == "true"
		filter.Available = &v
	}

	items, err := mc.menuService.List(c.Request.Context(), filter)
	if err != nil {
		if err == services.ErrInvalidInput {
			utils.Error(c, http.StatusBadRequest, "Invalid category filter")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "Could not load menu")
		return
	}

	mc.attachCategoryNames(c, items)
	utils.Success(c, http.StatusOK, items)
}

func (mc *MenuController) GetByID(c *gin.Context) {
	item, err := mc.menuService.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		mc.handleFetchError(c, err)
		return
	}

	items := []models.MenuItem{*item}
	mc.attachCategoryNames(c, items)
	utils.Success(c, http.StatusOK, items[0])
}

func (mc *MenuController) Create(c *gin.Context) {
	var input models.MenuItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please provide valid food item details")
		return
	}

	item, err := mc.menuService.Create(c.Request.Context(), input)
	if err != nil {
		if err == services.ErrInvalidInput {
			utils.Error(c, http.StatusBadRequest, "Invalid category")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "Could not create food item")
		return
	}

	utils.SuccessWithMessage(c, http.StatusCreated, "Food item created", item)
}

func (mc *MenuController) Update(c *gin.Context) {
	var input models.MenuItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please provide valid food item details")
		return
	}

	item, err := mc.menuService.Update(c.Request.Context(), c.Param("id"), input)
	if err != nil {
		mc.handleFetchError(c, err)
		return
	}

	utils.SuccessWithMessage(c, http.StatusOK, "Food item updated", item)
}

func (mc *MenuController) Delete(c *gin.Context) {
	err := mc.menuService.Delete(c.Request.Context(), c.Param("id"))
	if err != nil {
		mc.handleFetchError(c, err)
		return
	}

	utils.SuccessWithMessage(c, http.StatusOK, "Food item deleted", nil)
}

func (mc *MenuController) handleFetchError(c *gin.Context, err error) {
	switch err {
	case services.ErrNotFound:
		utils.Error(c, http.StatusNotFound, "Food item not found")
	case services.ErrInvalidInput:
		utils.Error(c, http.StatusBadRequest, "Invalid request")
	default:
		utils.Error(c, http.StatusInternalServerError, "Something went wrong")
	}
}

// attachCategoryNames enriches menu items with a human-readable category
// name so the frontend doesn't need a second round trip for display.
func (mc *MenuController) attachCategoryNames(c *gin.Context, items []models.MenuItem) {
	categories, err := mc.categoryService.List(c.Request.Context(), false)
	if err != nil {
		return
	}
	names := make(map[string]string, len(categories))
	for _, cat := range categories {
		names[cat.ID.Hex()] = cat.Name
	}
	for i := range items {
		items[i].CategoryName = names[items[i].CategoryID.Hex()]
	}
}
