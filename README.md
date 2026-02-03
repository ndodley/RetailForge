# Department Store Web Application

A full-stack e-commerce platform for a modern department store, built with the PERN stack (PostgreSQL, Express, React, Node.js). This project features a robust backend API, a beautiful React frontend, and a normalized SQL database. It supports user authentication, shopping cart, Stripe payments, product reviews, and a full admin dashboard.

---

## 🚀 Features

### 🛒 Customer Features

- **Browse Products**: View, search, and filter products by department and category
- **Product Details**: See detailed info, images, and reviews for each product
- **Shopping Cart**: Add, update, and remove items; persistent across sessions
- **Checkout**: Secure Stripe payment integration
- **Order Confirmation**: Receipt page after successful purchase
- **My Orders**: View all past orders and their details (products, quantities, totals)
- **User Registration & Login**: Secure session-based authentication
- **Leave Reviews**: Authenticated users can review products

### 🛠️ Admin/Manager Features

- **Admin Dashboard**: Manage departments, categories, products, users, and reviews
- **CRUD Operations**: Create, update, and delete all entities
- **Order Management**: View all orders in the system, see user emails, and inspect order details with product images
- **Modern Admin UI**: Orders pages feature a modern, responsive table and detail view
- **Role-Based Access**: Only managers/admins can access admin routes
- **Refresh-Safe Auth**: Admin pages remain accessible after refresh thanks to robust session hydration

### 🗄️ Database

- **PostgreSQL**: Normalized schema with migrations for all tables (users, products, orders, reviews, etc.)
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
DepartmentStore1_2025/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db.js
│   │   └── server.js
│   ├── database/
│   │   └── migrations/
│   └── package.json
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
git clone https://github.com/yourusername/DepartmentStore1_2025.git
cd DepartmentStore1_2025
```

### 2. Database Setup (PostgreSQL)

- Install PostgreSQL and create a database (e.g., `department_store1`)
- Run all SQL files in `database/migrations/` to create tables
- (Optional) Add seed data for demo users/products

### 3. Backend Setup

```sh
cd backend
npm install
# Copy .env.example to .env and fill in your DB, session, and Stripe keys
npm run dev
```

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
```

### Frontend (`frontend/.env`)

```
VITE_PUBLIC_STRIPE_KEY=your_stripe_publishable_key
```

---

## 📚 API Overview

- **Products**: `/api/products` (GET, POST, PUT, DELETE)
- **Categories/Departments**: `/api/categories`, `/api/departments`
- **Users/Auth**: `/api/users`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Cart**: `/api/cart`, `/api/cart/item`
- **Orders**:
  - `/api/orders/my` (current user)
  - `/api/orders/user/:user_id` (admin)
  - `/api/orders/admin` (admin/manager: all orders with user email)
  - `/api/orders/admin/:id` (admin/manager: order details with user email and items)
- **Order Details**: `/api/order-details/order/:order_id`
- **Reviews**: `/api/reviews`

---

## 🛡️ Security & Best Practices

- Passwords are hashed and never returned from the API
- Session cookies are HTTP-only and secure
- All sensitive keys are stored in `.env` (never commit secrets)
- CORS and session settings are production-ready
- Input validation and error handling throughout

---

## 🧑‍💻 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 🚧 Planned Features

These enhancements are in progress or coming soon:

### User Personal Pages

- **My Profile page**: View and update your personal info
- **My Orders page**: (In progress) See all your past orders and details
- **My Favorites page**: Save and manage favorite products
- **My Reviews page**: View and manage your product reviews

### Admin Pages

- **Admin Orders page**: Admin/manager can view all orders, see user emails, and inspect order details with product images (new!)

### Whole Project

- **Light/Dark Mode Toggle**: Switch between light and dark themes
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
