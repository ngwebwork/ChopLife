package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all environment-driven application configuration.
type Config struct {
	Port                   string
	MongoURI               string
	MongoDatabase          string
	JWTSecret              string
	JWTExpiryHours         int
	ClientURL              string
	WhatsAppNumber         string
	AllowAdminRegistration bool
}

var App *Config

// Load reads the .env file (if present) and populates the global App config.
// Missing .env files are tolerated so the app can run from real environment
// variables in production (Render/Railway/Fly.io).
func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	expiryHours, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "72"))
	if err != nil {
		expiryHours = 72
	}

	App = &Config{
		Port:                   getEnv("PORT", "8080"),
		MongoURI:               getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		MongoDatabase:          getEnv("MONGODB_DATABASE", "choplife"),
		JWTSecret:              getEnv("JWT_SECRET", ""),
		JWTExpiryHours:         expiryHours,
		ClientURL:              getEnv("CLIENT_URL", "http://localhost:5173"),
		WhatsAppNumber:         getEnv("WHATSAPP_NUMBER", ""),
		AllowAdminRegistration: getEnv("ALLOW_ADMIN_REGISTRATION", "false") == "true",
	}

	if App.JWTSecret == "" || App.JWTSecret == "change_this_secret" {
		log.Println("WARNING: JWT_SECRET is not set to a secure value. Set a strong secret before deploying to production.")
	}

	App.ClientURL = normalizeOrigin(App.ClientURL)

	return App
}

// normalizeOrigin defends against a common deployment mistake - setting
// CLIENT_URL without a scheme (e.g. "myapp.vercel.app" instead of
// "https://myapp.vercel.app") or with a stray trailing slash/quote. The CORS
// middleware requires an exact "http://" or "https://" prefixed origin and
// panics on startup otherwise, which would take the whole API down over a
// typo in one environment variable.
func normalizeOrigin(origin string) string {
	origin = strings.TrimSpace(origin)
	origin = strings.Trim(origin, `"'`)
	origin = strings.TrimSuffix(origin, "/")

	if origin == "*" {
		return origin
	}
	if origin == "" {
		log.Println("WARNING: CLIENT_URL is empty, falling back to http://localhost:5173")
		return "http://localhost:5173"
	}
	if !strings.HasPrefix(origin, "http://") && !strings.HasPrefix(origin, "https://") {
		log.Printf("WARNING: CLIENT_URL %q is missing a scheme, assuming https://", origin)
		origin = "https://" + origin
	}
	return origin
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
