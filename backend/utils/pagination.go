package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// PaginationParams holds the parsed page/limit query parameters.
type PaginationParams struct {
	Page  int64
	Limit int64
	Skip  int64
}

// ParsePagination reads "page" and "limit" query params with sane defaults
// and an upper bound to prevent abuse.
func ParsePagination(c *gin.Context) PaginationParams {
	page, err := strconv.ParseInt(c.DefaultQuery("page", "1"), 10, 64)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.ParseInt(c.DefaultQuery("limit", "20"), 10, 64)
	if err != nil || limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	return PaginationParams{
		Page:  page,
		Limit: limit,
		Skip:  (page - 1) * limit,
	}
}

// PaginatedResult is the standard shape returned for any paginated list endpoint.
type PaginatedResult struct {
	Items      interface{} `json:"items"`
	Page       int64       `json:"page"`
	Limit      int64       `json:"limit"`
	Total      int64       `json:"total"`
	TotalPages int64       `json:"totalPages"`
}

// BuildPaginatedResult computes total pages and assembles the response payload.
func BuildPaginatedResult(items interface{}, params PaginationParams, total int64) PaginatedResult {
	totalPages := total / params.Limit
	if total%params.Limit != 0 {
		totalPages++
	}
	return PaginatedResult{
		Items:      items,
		Page:       params.Page,
		Limit:      params.Limit,
		Total:      total,
		TotalPages: totalPages,
	}
}
