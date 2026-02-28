# RetailForge

A full-stack e-commerce platform for a modern department store, built with the PERN stack (PostgreSQL, Express, React, Node.js). This project features a robust backend API, a beautiful React frontend, and a normalized SQL database. It supports user authentication, shopping cart, Stripe payments, product reviews, and a full admin dashboard.

---

## 🚀 Features

### 🎨 Theme

- **Light/Dark Mode Toggle**: Switch themes from the navbar
- **Persisted Preference**: Saves your choice in localStorage and respects system preference on first load

### 🛒 Customer Features

- **Modern Home Page Carousel**: Larger, readable product cards in a horizontal showcase (supports mouse drag-to-scroll) with favorites + rating and click-through to product details
- **Browse Products**: View, search, and filter products by department and category
- **Advanced Search (Compact)**: Collapsible filter panel with search + sort + order
- **Dependent Filters**: Category options depend on selected Department
- **Product Details (Modernized)**: Improved dark-mode visuals, fixed-size product image frame (shows full image), availability status based on stock, and description formatting that preserves paragraphs/newlines
- **Shopping Cart**: Add, update, and remove items; persistent across sessions
- **Stock-Aware Cart**: Cart add/update prevents exceeding available stock and surfaces friendly errors when stock is insufficient
- **Checkout**: Secure Stripe payment integration
- **Stock-Safe Checkout**: Product stock is decremented atomically during checkout; checkout fails gracefully if stock is insufficient
- **Order Confirmation**: Receipt page after successful purchase
- **My Orders**: View all past orders and their details (products, quantities, totals)
- **My Favorites**: Save products you like and manage them from a dedicated page
- **Stable Favorites Page**: Fixed runtime crash and improved favorites rendering flow
- **My Reviews**: View, edit, and delete the reviews you’ve written
- **My Profile**: View and edit your account info, plus upload your own avatar image
- **User Registration & Login**: Secure session-based authentication
- **Leave Reviews**: Authenticated users can review products

### 🛠️ Admin/Manager Features

- **Admin Dashboard**: Manage departments, categories, products, users, and reviews
- **CRUD Operations**: Create, update, and delete all entities
- **Advanced Search Everywhere (Admin)**: Products, Users, Reviews, Departments, and Categories include Search + Sort + Order
- **Default Sort Order**: Search panels default to **Ascending** order for consistency
- **Admin Products UX Improvements**: Product rows are clickable to navigate to product details; description column removed from the list view while preserving Edit/Delete actions
- **Order Management**: View all orders in the system, see user emails, and inspect order details with product images
- **CSV Export (Admin)**: Download CSV exports from admin list pages (Departments, Categories, Products, Users, Reviews, Orders)
- **Bulk Upload (Admin)**: Upload CSV files to bulk-create Departments, Categories, Products, Users, and Reviews (includes preview + template download)
- **Orders: Details + Actions Columns**: View stays under Details; Edit/Delete are grouped under Actions
- **Order Status Edit Flow**: “Edit” opens details in edit mode for updating status
- **Modern Admin UI**: Icon-based action buttons and consistent spacing across admin tables
- **Role-Based Access**: Only managers/admins can access admin routes
- **Refresh-Safe Auth**: Admin pages remain accessible after refresh thanks to robust session hydration

### 🗄️ Database

- **PostgreSQL**: Normalized schema with migrations for all tables (users, products, orders, reviews, etc.)
- **Product Metadata**: Products support additional fields like `brand` and `rating`
- **Long Descriptions Supported**: `products.description` is stored as `TEXT` to support multi-paragraph descriptions
- **Secure Sessions**: Sessions stored in the database for persistence
- **Seed Data**: (Recommended) Add demo data for quick setup

---

## 🖼️ Screenshots & Demo Suggestions

> **Add these to your GitHub repo for maximum impact:**

- **Landing Page**: Show the product showcase and navigation
- **Product Details**: Highlight reviews and add-to-cart
- **Shopping Cart**: Show cart UI with items
- **Checkout**: Stripe payment form
- **Order Confirmation**: Receipt with purchased items
- **My Orders**: List of past orders with details
- **Admin Dashboard**: Table views for products, users, reviews, etc.
- **Mobile View**: Responsive design on a phone
- **GIF Demo**: (Optional) Short screen recording of browsing, adding to cart, and checking out

---

## 🏗️ Project Structure

```
RetailForge/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db.js
│   │   └── server.js
│   └── package.json
├── database/
│   └── migrations/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── public/
│   ├── index.html
│   └── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/RetailForge.git
cd RetailForge
```

### 2. Database Setup (PostgreSQL)

- Install PostgreSQL and create a database (e.g., `department_store1`)
- Run all SQL files in `database/migrations/` to create tables
- If you already created the DB earlier, make sure you also run the latest migrations:
  - `012_alter_products_description_to_text.sql`
- (Optional) Add seed data for demo users/products

### 3. Backend Setup

```sh
cd backend
npm install
# Copy .env.example to .env and fill in your DB, session, and Stripe keys
npm run dev
```

### 3a. (Optional) Kafka Setup (local dev)

Kafka is used for event-driven workflows. In this repo it publishes events for **orders**, **auth**, and **inventory**.

1. Start Kafka (Docker required):

```sh
cd RetailForge
docker compose -f docker-compose.kafka.yml up -d
```

2. Enable Kafka in the backend env:

- Copy [backend/.env.example](backend/.env.example) to `backend/.env`
- Set:

```
KAFKA_ENABLED=true
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_ORDERS=rf.orders
KAFKA_TOPIC_AUTH=rf.auth
KAFKA_TOPIC_INVENTORY=rf.inventory

# Inventory alerts (optional)
LOW_STOCK_THRESHOLD=5
```

3. Install the Kafka client library and run the consumer worker:

```sh
cd backend
npm install kafkajs
node src/workers/kafkaWorker.js
```

The worker subscribes to the configured topics and logs events as they arrive.

**Events published (best-effort):**

- Orders topic: `order.created`, `order.paid`, `order.status_updated`
- Auth topic: `user.logged_in`, `auth.login_failed`
- Inventory topic: `inventory.low_stock`, `inventory.out_of_stock`

`LOW_STOCK_THRESHOLD` controls when `inventory.low_stock` is emitted (defaults to `5`).

### 3b. Load Testing (Artillery)

This repo includes Artillery scenarios to load test the backend API with **many concurrent sessions**. The most important scenario is the checkout flow, which intentionally creates real contention for stock so you can verify:

- Session-based login works under concurrency
- Carts and checkout behave correctly with many requests in-flight
- Inventory is never oversold (stock decrements atomically; failures return `409`)
- Kafka events are emitted for auth/order/inventory (when Kafka is enabled)

#### Prerequisites

1. Backend API running:

```sh
cd backend
npm run dev
```

2. Database migrated and seeded with products that have non-zero `stock`.

3. (Optional, for event verification) Kafka + worker running:

```sh
docker compose -f docker-compose.kafka.yml up -d
cd backend
node src/workers/kafkaWorker.js
```

#### Scenarios & scripts

Run these from the `backend/` folder:

```sh
npm run load:browse
npm run load:login-failed
npm run load:checkout
```

- `load:browse`: basic GET traffic against products
- `load:login-failed`: intentionally invalid logins (useful to confirm `auth.login_failed` Kafka events)
- `load:checkout`: end-to-end checkout load test

#### Checkout test: what it simulates

Each virtual user (VU) runs a full flow:

1. `POST /api/auth/login` using credentials from `backend/artillery/data/users.example.csv`
2. `GET /api/cart/user/:userId` (get-or-create cart)
3. `GET /api/products` (select a product)
4. `POST /api/cart/item` (attempt to add quantity=1)
5. `POST /api/payment/complete-checkout` (only attempted when the add-to-cart step succeeds)

Because many VUs overlap in time, this creates real concurrency where multiple shoppers race to buy the same inventory.

#### How many users are “at the same time”?

In the default checkout scenario, Artillery uses an **arrival rate** (new users started per second) and a **duration**. Roughly:

$$\text{VUs created} \approx \text{arrivalRate} \times \text{duration}$$

For example, `arrivalRate: 2` for `duration: 60` seconds creates about `120` VUs.

Note: if your CSV contains only a few accounts, Artillery will reuse them across VUs. That still produces true concurrent API sessions, but it is not the same as 120 unique customer identities. If you want “one account per VU”, expand the CSV.

#### Interpreting results (this is the key)

In this test you should expect a mixture of success and contention:

- `201 Created` from `/api/payment/complete-checkout` means an order was created successfully.
- `409 Conflict` means **insufficient stock**. This is expected under load and is a good sign: it indicates your inventory rules are preventing overselling.
- Occasional `400` responses usually mean a business-rule rejection (e.g., missing fields or cart empty). With the current scenario, checkout is gated on add-to-cart success, so persistent `400`s are not expected.

The backend enforces stock correctness by using an atomic stock decrement in the database and wrapping checkout in a transaction; under concurrency this produces `409` responses rather than negative stock.

#### Kafka: what you should see

When Kafka is enabled and `node src/workers/kafkaWorker.js` is running, a successful checkout run should produce:

- Auth topic: `user.logged_in`
- Orders topic: `order.created`, `order.paid`
- Inventory topic (when thresholds are crossed): `inventory.low_stock`, `inventory.out_of_stock`

This gives you an end-to-end validation: HTTP requests create orders, inventory updates, and Kafka events observable by a worker.

### 4. Frontend Setup

```sh
cd ../frontend
npm install
# Copy .env.example to .env and set VITE_PUBLIC_STRIPE_KEY
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```
POSTGRES_DB=department_store1
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=your_stripe_secret

# Kafka (optional)
KAFKA_ENABLED=false
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=retailforge-backend
KAFKA_TOPIC_ORDERS=rf.orders
KAFKA_TOPIC_AUTH=rf.auth
KAFKA_TOPIC_INVENTORY=rf.inventory

# Inventory alerts
LOW_STOCK_THRESHOLD=5
```

### Frontend (`frontend/.env`)

```
VITE_PUBLIC_STRIPE_KEY=your_stripe_publishable_key
```

---

## 📚 API Overview

- **Products**: `/api/products` (GET, POST, PUT, DELETE)
- **Products Bulk Create (admin/manager)**: `POST /api/products/bulk`
- **Categories/Departments**: `/api/categories`, `/api/departments`
- **Categories Bulk Create (admin/manager)**: `POST /api/categories/bulk`
- **Departments Bulk Create (admin/manager)**: `POST /api/departments/bulk`
- **Users/Auth**: `/api/users`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Users Bulk Create (admin/manager)**: `POST /api/users/bulk`
- **Current User Profile**:
  - `GET /api/users/me` (get signed-in user profile)
  - `PUT /api/users/me` (update signed-in user profile fields)
  - `PUT /api/users/me/avatar` (upload avatar image)
- **Cart**: `/api/cart`, `/api/cart/item`
- **Orders**:
  - `/api/orders/my` (current user)
  - `/api/orders/user/:user_id` (admin)
  - `/api/orders/admin` (admin/manager: all orders with user email)
  - `/api/orders/admin/:id` (admin/manager: order details with user email and items)
- **Order Details**: `/api/order-details/order/:order_id`
- **Reviews**:
  - `/api/reviews` (admin + product review operations)
  - `GET /api/reviews/my` (current user)
  - `PUT /api/reviews/my/:id` (current user)
  - `DELETE /api/reviews/my/:id` (current user)
  - **Reviews Bulk Create (admin/manager)**: `POST /api/reviews/bulk`
- **Favorites**:
  - `GET /api/favorites/my/ids`
  - `GET /api/favorites/my`
  - `POST /api/favorites/toggle`
  - `POST /api/favorites`
  - `DELETE /api/favorites/:productId`

---

## 📦 CSV Export & Bulk Upload (Admin)

### CSV Export

- Admin list pages include a **Download CSV** button (where applicable).

### Bulk Upload

- Bulk upload is available on the **“Add New …”** admin pages (not on edit pages).
- The bulk upload UI includes:
  - **Download Template** (headers-only CSV)
  - CSV file picker
  - Row preview
  - **Confirm Upload** to POST `{ rows: [...] }`

### CSV Schemas (important)

- CSV parsing is **strict**: headers must match the template exactly.
- Products CSV uses **category_name** (and optional **department_name**) instead of `category_id`.

**Products (`products.csv`) columns:**

- `name`, `brand`, `rating`, `description`, `price`, `stock`, `category_name`, `department_name` (optional), `image_path` (optional)

**Categories (`categories.csv`) columns:**

- `name`, `description`, `department_name`

**Users (`users.csv`) columns:**

- `first_name`, `last_name`, `email`, `password`, `role`, `phone_number`, `address`

**Reviews (`reviews.csv`) columns:**

- `product_id`, `user_id`, `rating`, `comment`

---

## 🛡️ Security & Best Practices

- Passwords are hashed (bcrypt) and never returned from API responses
- Session cookies are HTTP-only and sent via `credentials: 'include'`
- For a production deployment, you should:
  - Ensure secrets (Stripe key, session secret, DB credentials) live in `.env` and are not committed
  - Enable HTTPS and set session cookies to `secure: true`

---

## 🧑‍💻 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 🚧 Planned Features

These enhancements are in progress or coming soon:

### User Personal Pages

- **More profile options**: Password change, email verification, and stronger validation

### Admin Pages

- **More admin polish**: Continued UX improvements, consistency, and validations across all admin forms

### Whole Project

- **Modernize All Pages**: Refactor all UI to use modern React best practices
- **Refresh-Safe Auth**: All protected pages now wait for session hydration before redirecting, so admin and user pages are refresh-safe
- **Fix Project Title**: Update and standardize the project title across all pages

Want to contribute? Check the issues or project board for these features!

## 📬 Contact

- [Your Name](mailto:your.email@example.com)
- [LinkedIn](https://www.linkedin.com/in/yourprofile)

---

## ⭐️ Tips for a Standout GitHub Repo

- Add the screenshots/GIFs listed above to the top of this README
- Use badges (build, license, etc.)
- Pin a demo video if possible
- Write a short project summary in your GitHub repo description
- Keep your `.env` files out of version control
- Add a `CONTRIBUTING.md` if you want to encourage collaboration

---

> **This project demonstrates a full-stack, production-grade e-commerce platform with modern best practices. Perfect for your portfolio and to impress interviewers!**
