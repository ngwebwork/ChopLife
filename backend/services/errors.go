package services

import "errors"

// Sentinel errors returned by the service layer. Controllers translate these
// into the appropriate HTTP status codes without needing to know about
// MongoDB-specific error types.
var (
	ErrNotFound      = errors.New("resource not found")
	ErrDuplicate     = errors.New("resource already exists")
	ErrInvalidInput  = errors.New("invalid input")
	ErrInvalidStatus = errors.New("invalid status transition")
	ErrUnauthorized  = errors.New("invalid credentials")
)
