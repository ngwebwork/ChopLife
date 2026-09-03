# ChopLife Kitchen 🍲

**Fresh meals. Fast delivery. No stress.**

A production-quality, full-stack restaurant ordering platform for a Nigerian
restaurant brand. Customers browse the menu, order as guests, pay cash on
delivery (or reserve online payment for later), and track their order live.
Restaurant staff run the whole operation from an admin dashboard — orders,
menu, categories, customers and settings.

Built as a real, deployable product — not a tutorial project.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [MongoDB Setup](#mongodb-setup)
- [Environment Variables](#environment-variables)
- [Installation & Running Locally (Windows)](#installation--running-locally-windows)
- [Seeding the Database](#seeding-the-database)
- [API Documentation](#api-documentation)
- [Admin Login](#admin-login)
- [Deployment](#deployment)
- [Known Trade-offs / Next Steps](#known-trade-offs--next-steps)

---

## Features

### Customer-facing

- Modern, mobile-first storefront (home, menu, food details, cart, checkout)
- Search, category filters, sorting and availability filters on the menu
- Cart with extras, special instructions and quantity controls, persisted in `localStorage`
- Guest checkout (no account required) with full form validation
- Order confirmation page with a shareable WhatsApp order message
- Live order tracking (`/order/:orderNumber`) with a visual status timeline, auto-refreshing every 10s
- Fully responsive from 360px phones to large desktops

### Admin

- JWT-protected admin dashboard (`/admin`) with live stats (today's orders, revenue, pending/completed)
- Order management with status workflow (`Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered`, or `Cancelled`)
- Menu management: create/edit/delete dishes, extras, ingredients, availability, "popular" flag
- Category management: create/edit/delete, enable/disable
- Customer summary derived from order history
- Restaurant settings: name, logo, contact info, delivery fee, minimum order, social links, WhatsApp number

### Engineering

- Clean layered backend: `routes → controllers → services → database`
- Server-computed order pricing (never trusts client-submitted prices)
- Consistent `{ success, data, message }` API envelope
- JWT auth + bcrypt password hashing + role-based admin middleware
- MongoDB indexes for query performance and uniqueness (emails, order numbers, etc.)
- Toasts, skeleton loaders, empty states and confirmation dialogs throughout
- No fake buttons — every action in the UI performs a real request

---

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Zustand, React Hook Form, Axios, Lucide React

**Backend:** Go, Gin, MongoDB (official `go.mongodb.org/mongo-driver`), JWT (`golang-jwt/jwt`), bcrypt (`golang.org/x/crypto`)

**Database:** MongoDB (local or Atlas)

---

## Architecture

```
Browser (React SPA)
      │  Axios (Bearer JWT for admin routes)
      ▼
Go/Gin REST API  (routes → controllers → services → database)
      │  official MongoDB driver
      ▼
MongoDB  (users, menu_items, categories, orders, settings, counters)
```

Order pricing is always recomputed server-side from the live menu at order
time — the client only sends `menuItemId`, `quantity`, chosen extras and
instructions. This prevents price tampering and keeps historical orders
accurate even if menu prices change later.

---

## Folder Structure

```text
choplife-kitchen/
├── frontend/
│   ├── src/
│   │   ├── components/    # common/, layout/, menu/, cart/, admin/
│   │   ├── pages/         # customer pages + pages/admin/
│   │   ├── layouts/       # MainLayout, AdminLayout
│   │   ├── hooks/         # useDebounce, usePolling, useDocumentTitle
│   │   ├── services/      # axios instance + one module per resource
│   │   ├── store/         # zustand: cart, auth, settings, toast
│   │   ├── types/         # shared TypeScript interfaces
│   │   └── utils/         # currency, date, whatsapp helpers
│   └── vite.config.ts
│
├── backend/
│   ├── cmd/seed/          # `go run ./cmd/seed` — sample data
│   ├── config/            # env loading
│   ├── controllers/       # HTTP handlers
│   ├── services/          # business logic + MongoDB access
│   ├── models/            # structs + request payloads
│   ├── middleware/        # auth, CORS, recovery/logging
│   ├── routes/            # route wiring
│   ├── database/          # Mongo connection + indexes
│   ├── utils/             # JWT, bcrypt, order numbers, pagination, responses
│   └── main.go
│
└── README.md
```

---

## Prerequisites

- [Go](https://go.dev/dl/) 1.22+
- [Node.js](https://nodejs.org/) 20+
- MongoDB — any of:
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed locally, or
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) (`docker run -d -p 27017:27017 --name choplife-mongo mongo:7`), or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

## MongoDB Setup

Any of the options above works — the backend only needs a connection string
in `MONGODB_URI`. For local development, the simplest is Docker:

```cmd
docker run -d -p 27017:27017 --name choplife-mongo mongo:7
```

For Atlas, create a free cluster, add your IP to the access list, create a
database user, and copy the connection string (it looks like
`mongodb+srv://user:password@cluster0.xxxxx.mongodb.net`).

---

## Environment Variables

### Backend (`backend/.env` — copy from `backend/.env.example`)

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=choplife
JWT_SECRET=change_this_secret
JWT_EXPIRY_HOURS=72
CLIENT_URL=http://localhost:5173
WHATSAPP_NUMBER=2348012345678
```

- `JWT_SECRET` — **must** be changed to a long random value in production.
- `CLIENT_URL` — used for CORS; must match the deployed frontend origin exactly.
- `WHATSAPP_NUMBER` — fallback WhatsApp number (digits only, with country code, no `+`). The number actually used by the storefront comes from **Admin → Settings** once configured, so it can be changed without a redeploy.

### Frontend (`frontend/.env` — copy from `frontend/.env.example`)

```env
VITE_API_URL=http://localhost:8080/api
VITE_WHATSAPP_NUMBER=2348012345678
```

---

## Installation & Running Locally (Windows)

Open two terminals (Command Prompt or PowerShell).

**Terminal 1 — Backend**

```cmd
cd backend
copy .env.example .env
go mod tidy
go run ./cmd/seed
go run .
```

The API starts on `http://localhost:8080`. `go run ./cmd/seed` populates
categories, menu items, restaurant settings and a default admin account
(see [Admin Login](#admin-login)) — safe to re-run any time, it upserts.

**Terminal 2 — Frontend**

```cmd
cd frontend
copy .env.example .env
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

### Building for production

```cmd
cd backend
go build -o choplife-backend.exe .

cd ..\frontend
npm run build
```

The frontend build output is written to `frontend/dist/`.

---

## Seeding the Database

```cmd
cd backend
go run ./cmd/seed
```

This seeds:

- 7 categories (Rice, Swallow, Soups, Grills, Fast Food, Drinks, Desserts)
- 13 menu items with realistic Naira prices, extras and ingredients
- Restaurant settings (delivery fee ₦1,500, minimum order ₦2,000, etc.)
- One default admin account

The seed script is idempotent — it upserts by name/email, so running it
again won't create duplicates.

---

## API Documentation

Base URL: `http://localhost:8080/api`

All responses use the envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Human-readable error" }
```

Routes marked 🔒 require `Authorization: Bearer <token>` from an admin login.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create an admin account |
| POST | `/auth/login` | Log in, returns `{ token, user }` |
| GET | `/auth/me` 🔒 | Return the current admin's identity |

### Menu

| Method | Path | Description |
|---|---|---|
| GET | `/menu` | List menu items. Query: `category`, `search`, `popular`, `available` |
| GET | `/menu/:id` | Get one menu item |
| POST | `/menu` 🔒 | Create a menu item |
| PUT | `/menu/:id` 🔒 | Update a menu item |
| DELETE | `/menu/:id` 🔒 | Delete a menu item |

### Categories

| Method | Path | Description |
|---|---|---|
| GET | `/categories` | List categories. Query: `active=true` for active-only |
| POST | `/categories` 🔒 | Create a category |
| PUT | `/categories/:id` 🔒 | Update a category |
| DELETE | `/categories/:id` 🔒 | Delete a category |

### Orders

| Method | Path | Description |
|---|---|---|
| POST | `/orders` | Place an order (guest checkout) |
| GET | `/orders/:orderNumber` | Look up an order for tracking (public) |
| GET | `/orders` 🔒 | Paginated order list. Query: `page`, `limit`, `status` |
| GET | `/orders/stats` 🔒 | Dashboard statistics |
| PUT | `/orders/:id/status` 🔒 | Update order status |

### Settings

| Method | Path | Description |
|---|---|---|
| GET | `/settings` | Public restaurant settings (name, hours, delivery fee, WhatsApp, ...) |
| PUT | `/settings` 🔒 | Update restaurant settings |

### Example: placing an order

```json
POST /api/orders
{
  "customer": { "name": "Adaeze Okafor", "phone": "08012345678", "email": "adaeze@example.com" },
  "items": [
    { "menuItemId": "<id>", "quantity": 2, "extras": [{ "name": "Extra Chicken", "price": 2000 }], "specialInstructions": "less spicy" }
  ],
  "deliveryAddress": "12 Admiralty Way, Lekki Phase 1",
  "city": "Lagos",
  "phone": "08012345678",
  "paymentMethod": "Cash on Delivery",
  "specialInstructions": ""
}
```

The server looks up each `menuItemId`, validates availability and extras,
and computes `subtotal`/`total` itself — it ignores any price the client
might send.

---

## Admin Login

After seeding, sign in at `/admin/login` with:

```
Email:    admin@choplife.com
Password: Admin@123
```

**Change this password immediately after first login in a real deployment.**
An admin registration page also exists at `/admin/register` for creating
additional accounts — restrict or remove public access to it once your
restaurant's admin accounts are set up (see [Known Trade-offs](#known-trade-offs--next-steps)).

---

## Deployment

### Frontend → Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel, set the root directory to `frontend`.
3. Build command: `npm run build`, output directory: `dist`.
4. Add environment variable `VITE_API_URL` pointing to your deployed backend, e.g. `https://your-api.onrender.com/api`.

### Backend → Render / Railway / Fly.io

1. Point the service at the `backend` directory.
2. Build command: `go build -o app .` — start command: `./app`.
3. Set environment variables: `PORT` (usually provided by the platform), `MONGODB_URI`, `MONGODB_DATABASE`, `JWT_SECRET`, `CLIENT_URL` (your deployed frontend origin), `WHATSAPP_NUMBER`.
4. Make sure `CLIENT_URL` matches the frontend's real origin exactly, or CORS will block requests.

### Database → MongoDB Atlas

1. Create a free cluster, a database user, and allow network access from your backend host (or `0.0.0.0/0` for simplicity, tightened later).
2. Use the `mongodb+srv://...` connection string as `MONGODB_URI`.
3. Run the seed command once against the production database (from your local machine, pointing `MONGODB_URI` at Atlas) to create the initial admin account and starter menu.

---

## Known Trade-offs / Next Steps

These are deliberate MVP scope decisions, called out for transparency:

- **Online payment** is architected (`paymentMethod`, `paymentStatus`, `paymentReference` fields exist end-to-end) but not wired to Paystack yet — the spec asked for the structure, not a fake integration. Cash on Delivery is fully functional.
- **Admin JWT is stored in `localStorage`** (standard for JWT SPAs) rather than an httpOnly cookie. For a hardened production deployment, consider moving to a cookie-based session.
- **Admin registration is open** at `/admin/register` for initial setup convenience. Once your restaurant's admin accounts exist, remove or protect this route (e.g. behind an invite code or by disabling the endpoint).
- **Delivery pricing** is a single configurable flat fee (Admin → Settings). The order model and settings are structured so location/zone-based pricing can be layered in later without a schema change.
- **Customers list** in admin is derived from order history (no separate customer accounts in the MVP, per spec — customers order as guests).
