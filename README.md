# ChopLife Kitchen 🍲

**Fresh meals. Fast delivery. No stress.**

ChopLife Kitchen is a full-stack Nigerian restaurant ordering platform built to provide a smooth food-ordering experience for customers and a practical operations dashboard for restaurant staff.

Customers can browse meals, customize orders, check out as guests, choose a payment method, receive an order number, and track their order. Restaurant staff can manage orders, menu items, categories, customers, restaurant settings, and order status from a protected admin dashboard.

> **Built as a real-world portfolio project — focused on usability, responsive UI, API design, authentication, database integration, and restaurant operations.**

---

## 🌐 Live Demo

**Frontend:**
https://choplife-lime.vercel.app

---

## ✨ Highlights

* 🍛 Modern Nigerian food-focused restaurant storefront
* 🔎 Menu search, category filtering, sorting, and availability filtering
* 🛒 Persistent shopping cart with quantities, extras, and special instructions
* 👤 Guest checkout — no account required
* 📱 WhatsApp-friendly order confirmation and sharing
* 📦 Order tracking with a visual status timeline
* ⚡ Automatic order refresh for near real-time tracking
* 🔐 JWT-protected admin dashboard
* 📊 Admin statistics for orders, revenue, pending orders, and completed orders
* 🍽️ Full menu and category management
* ⚙️ Restaurant settings management
* 💰 Server-side order total calculation to prevent client-side price tampering
* 📱 Fully responsive across mobile, tablet, and desktop

---

## 📋 Table of Contents

* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Architecture](#-architecture)
* [Project Structure](#-project-structure)
* [Prerequisites](#-prerequisites)
* [MongoDB Setup](#-mongodb-setup)
* [Environment Variables](#-environment-variables)
* [Run Locally](#-run-locally)
* [Seed the Database](#-seed-the-database)
* [API Overview](#-api-overview)
* [Admin Access](#-admin-access)
* [Payment Model](#-payment-model)
* [Deployment](#-deployment)
* [Known Limitations](#-known-limitations)
* [Future Improvements](#-future-improvements)
* [Why I Built This](#-why-i-built-this)

---

## 🚀 Features

### Customer Experience

* Modern, mobile-first restaurant storefront
* Home, menu, food details, cart, checkout, and order tracking pages
* Search by food name
* Filter by category
* Sort menu items
* Filter available items
* Add extras to menu items
* Add special instructions
* Cart persisted in `localStorage`
* Guest checkout with form validation
* Order confirmation with order number
* Shareable WhatsApp order message
* Public order tracking using `/order/:orderNumber`
* Visual order status timeline
* Automatic tracking refresh
* Responsive design from small mobile screens to large desktops

### Admin Dashboard

* Protected admin authentication
* Dashboard statistics
* Order management
* Order status workflow:

```text
Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered
```

* Cancelled order state
* Create, update, and delete menu items
* Manage menu extras
* Manage ingredients
* Toggle item availability
* Mark items as popular
* Create, update, and delete categories
* Enable or disable categories
* View customer information derived from order history
* Update restaurant information and delivery settings
* Manage WhatsApp contact information and social links

### Engineering

* Layered backend architecture
* REST API built with Go and Gin
* MongoDB persistence
* JWT authentication
* Bcrypt password hashing
* Role-based admin middleware
* Server-side price calculation
* MongoDB indexes for important queries and unique fields
* Consistent API response envelope
* Loading states, empty states, confirmation dialogs, and toast feedback
* Real API actions throughout the dashboard instead of placeholder buttons

---

## 🛠️ Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS v4
* React Router
* Zustand
* React Hook Form
* Axios
* Lucide React

### Backend

* Go
* Gin
* MongoDB Official Go Driver
* JWT
* Bcrypt

### Database

* MongoDB
* MongoDB Atlas for production
* Local MongoDB for development

### Deployment

* Vercel for the frontend
* Render, Railway, or Fly.io for the backend
* MongoDB Atlas for production database hosting

---

## 🧩 Architecture

```text
                     ┌─────────────────────┐
                     │    React Frontend   │
                     │   Vite + Tailwind   │
                     └──────────┬──────────┘
                                │
                         Axios / REST API
                                │
                                ▼
                     ┌─────────────────────┐
                     │    Go + Gin API     │
                     │                     │
                     │ Routes              │
                     │ Controllers         │
                     │ Services            │
                     │ Middleware          │
                     └──────────┬──────────┘
                                │
                         MongoDB Driver
                                │
                                ▼
                     ┌─────────────────────┐
                     │       MongoDB       │
                     │                     │
                     │ Users               │
                     │ Menu Items          │
                     │ Categories          │
                     │ Orders              │
                     │ Settings            │
                     │ Counters            │
                     └─────────────────────┘
```

### Order Pricing

The frontend sends:

* Menu item IDs
* Quantities
* Selected extras
* Special instructions

The backend then looks up the current menu data and calculates the order total itself.

This means the API does **not** trust prices coming directly from the browser.

---

## 📁 Project Structure

```text
choplife-kitchen/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── menu/
│   │   │   ├── cart/
│   │   │   └── admin/
│   │   │
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── vite.config.ts
│
├── backend/
│   ├── cmd/
│   │   └── seed/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── database/
│   ├── utils/
│   └── main.go
│
└── README.md
```

---

## ✅ Prerequisites

Make sure these are installed:

* [Go](https://go.dev/dl/) 1.22+
* [Node.js](https://nodejs.org/) 20+
* [MongoDB Community Server](https://www.mongodb.com/try/download/community)

---

## 🗄️ MongoDB Setup

ChopLife uses **local MongoDB** during development.

Make sure the MongoDB service is installed and running on your computer.

### Local MongoDB

The default connection string is:

```env
MONGODB_URI=mongodb://localhost:27017
```

The application uses the `choplife` database:

```env
MONGODB_DATABASE=choplife
```

You can verify that MongoDB is running through MongoDB Compass or `mongosh`.

### MongoDB Atlas

For production deployment, MongoDB Atlas can be used instead.

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

---

## 🔐 Environment Variables

### Backend — `backend/.env`

Create the file from `.env.example`:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=choplife
JWT_SECRET=change_this_secret
JWT_EXPIRY_HOURS=72
CLIENT_URL=http://localhost:5173
WHATSAPP_NUMBER=2348012345678
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:8080/api
VITE_WHATSAPP_NUMBER=2348012345678
```

### Production Notes

* Replace `JWT_SECRET` with a strong random secret.
* Set `CLIENT_URL` to the exact deployed frontend origin.
* Use your real WhatsApp business number.
* Never commit `.env` files or production secrets to GitHub.

---

## 💻 Run Locally

The project can be run on Windows using Command Prompt or PowerShell.

### 1. Start the Backend

```cmd
cd backend
copy .env.example .env
go mod tidy
go run ./cmd/seed
go run .
```

Backend:

```text
http://localhost:8080
```

### 2. Start the Frontend

Open another terminal:

```cmd
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🌱 Seed the Database

Run:

```cmd
cd backend
go run ./cmd/seed
```

The seed script creates starter data including:

* 7 food categories
* 13 menu items
* Menu prices
* Ingredients
* Extras
* Restaurant settings
* Delivery fee and minimum order settings
* Default admin account

The seed operation is designed to be safely re-run without creating duplicate starter records.

---

## 🔌 API Overview

Base URL:

```text
http://localhost:8080/api
```

### Response Format

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Human-readable error"
}
```

### Authentication

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/register` | Create an admin account |
| POST   | `/auth/login`    | Login and receive JWT   |
| GET    | `/auth/me`       | Get current admin 🔒    |

### Menu

| Method | Endpoint    | Description         |
| ------ | ----------- | ------------------- |
| GET    | `/menu`     | List menu items     |
| GET    | `/menu/:id` | Get one menu item   |
| POST   | `/menu`     | Create menu item 🔒 |
| PUT    | `/menu/:id` | Update menu item 🔒 |
| DELETE | `/menu/:id` | Delete menu item 🔒 |

### Categories

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| GET    | `/categories`     | List categories    |
| POST   | `/categories`     | Create category 🔒 |
| PUT    | `/categories/:id` | Update category 🔒 |
| DELETE | `/categories/:id` | Delete category 🔒 |

### Orders

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| POST   | `/orders`              | Place guest order       |
| GET    | `/orders/:orderNumber` | Track public order      |
| GET    | `/orders`              | List orders 🔒          |
| GET    | `/orders/stats`        | Dashboard statistics 🔒 |
| PUT    | `/orders/:id/status`   | Update order status 🔒  |

### Settings

| Method | Endpoint    | Description                    |
| ------ | ----------- | ------------------------------ |
| GET    | `/settings` | Get public restaurant settings |
| PUT    | `/settings` | Update settings 🔒             |

---

## 👨‍💼 Admin Access

After seeding the database, the default development admin is:

```text
Email: admin@choplife.com
Password: Admin@123
```

Admin login:

```text
/admin/login
```

> **Important:** Change the default password immediately in any real deployment.

---

## 💳 Payment Model

The current project supports two payment options:

### Cash on Delivery

Customers place an order and payment is collected when the order is delivered.

### Demo Payment

A simulated online payment flow created for portfolio/demo purposes.

The demo payment system:

* Does not process real money
* Does not collect card details
* Simulates a successful payment

A real integration with **Paystack, Flutterwave, or Stripe** can be added later without redesigning the core order system.

---

## 🚀 Deployment

### Frontend - Vercel

The frontend is deployed on Vercel.

For deployment:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Set the project root to `frontend`.
4. Use the following build command:

```text
npm run build
```

5. Output directory:

```text
dist
```

6. Configure the API URL:

```env
VITE_API_URL=https://your-backend-url/api
```

### Backend — Render / Railway / Fly.io

Deploy the `backend` directory and configure:

```env
PORT=8080
MONGODB_URI=your_mongodb_atlas_uri
MONGODB_DATABASE=choplife
JWT_SECRET=your_production_secret
JWT_EXPIRY_HOURS=72
CLIENT_URL=https://your-frontend-url.vercel.app
WHATSAPP_NUMBER=your_whatsapp_number
```

### Database — MongoDB Atlas

For production, use MongoDB Atlas and set `MONGODB_URI` to your Atlas connection string.

---

## ⚠️ Known Limitations

These are intentional MVP decisions:

* Online payment is currently simulated for demo purposes.
* Admin JWT is stored in `localStorage`.
* Admin registration is available for initial setup and should be restricted in production.
* Delivery pricing currently uses a configurable flat fee.
* Customers do not have dedicated accounts; customer information is derived from order history.

---

## 🔮 Future Improvements

Potential future improvements include:

* Real Paystack or Flutterwave payment integration
* Zone-based delivery pricing
* Customer accounts and order history
* Promo codes and discounts
* Inventory tracking
* Restaurant staff roles and permissions
* Email/SMS order notifications
* Advanced sales and revenue analytics
* Order receipt generation
* Automated deployment and CI/CD

---

## 👨‍💻 Why I Built This

ChopLife Kitchen was built to demonstrate how a real business workflow can be translated into a complete full-stack web application.

The project covers the complete flow from:

**Customer browsing → Cart → Checkout → Order creation → Database persistence → Order tracking → Restaurant administration**

It combines a polished React frontend with a structured Go backend and MongoDB database instead of treating the project as a simple static food website.

---

## 📄 License

This project is primarily intended as a portfolio and learning project.
