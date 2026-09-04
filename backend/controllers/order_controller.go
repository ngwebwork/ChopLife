package controllers

import (
	"net/http"

	"choplife-backend/models"
	"choplife-backend/services"
	"choplife-backend/utils"

	"github.com/gin-gonic/gin"
)

type OrderController struct {
	orderService *services.OrderService
}

func NewOrderController() *OrderController {
	return &OrderController{orderService: services.NewOrderService()}
}

func (oc *OrderController) Create(c *gin.Context) {
	var input models.CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please check your order details and try again")
		return
	}

	order, err := oc.orderService.Create(c.Request.Context(), input)
	if err != nil {
		switch err {
		case services.ErrInvalidInput:
			utils.Error(c, http.StatusBadRequest, "One or more items in your order are unavailable")
		case services.ErrNotFound:
			utils.Error(c, http.StatusBadRequest, "One or more items in your order could not be found")
		default:
			utils.Error(c, http.StatusInternalServerError, "Could not place order. Please try again.")
		}
		return
	}

	utils.SuccessWithMessage(c, http.StatusCreated, "Order placed successfully", order)
}

func (oc *OrderController) GetByOrderNumber(c *gin.Context) {
	order, err := oc.orderService.GetByOrderNumber(c.Request.Context(), c.Param("orderNumber"))
	if err != nil {
		if err == services.ErrNotFound {
			utils.Error(c, http.StatusNotFound, "Order not found. Please check your order number.")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "Could not fetch order")
		return
	}
	utils.Success(c, http.StatusOK, order)
}

func (oc *OrderController) List(c *gin.Context) {
	filter := services.OrderFilter{Status: c.Query("status")}
	pagination := utils.ParsePagination(c)

	orders, total, err := oc.orderService.List(c.Request.Context(), filter, pagination)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Could not load orders")
		return
	}

	utils.Success(c, http.StatusOK, utils.BuildPaginatedResult(orders, pagination, total))
}

type updateStatusRequest struct {
	OrderStatus string `json:"orderStatus" binding:"required"`
}

func (oc *OrderController) UpdateStatus(c *gin.Context) {
	var req updateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Please provide a valid order status")
		return
	}

	order, err := oc.orderService.UpdateStatus(c.Request.Context(), c.Param("id"), req.OrderStatus)
	if err != nil {
		switch err {
		case services.ErrNotFound:
			utils.Error(c, http.StatusNotFound, "Order not found")
		case services.ErrInvalidStatus, services.ErrInvalidInput:
			utils.Error(c, http.StatusBadRequest, "Invalid order status")
		default:
			utils.Error(c, http.StatusInternalServerError, "Could not update order status")
		}
		return
	}

	utils.SuccessWithMessage(c, http.StatusOK, "Order status updated", order)
}

func (oc *OrderController) Stats(c *gin.Context) {
	stats, err := oc.orderService.GetStats(c.Request.Context())
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Could not load dashboard statistics")
		return
	}
	utils.Success(c, http.StatusOK, stats)
}
