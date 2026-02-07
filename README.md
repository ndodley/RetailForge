# Department Store Web Application

A full-stack e-commerce platform for a modern department store, built with the PERN stack (PostgreSQL, Express, React, Node.js). This project features a robust backend API, a beautiful React frontend, and a normalized SQL database. It supports user authentication, shopping cart, Stripe payments, product reviews, and a full admin dashboard.

---

## 🚀 Features

### 🎨 Theme

- **Light/Dark Mode Toggle**: Switch themes from the navbar
- **Persisted Preference**: Saves your choice in localStorage and respects system preference on first load

### 🛒 Customer Features

- **Browse Products**: View, search, and filter products by department and category
- **Advanced Search (Compact)**: Collapsible filter panel with search + sort + order
- **Dependent Filters**: Category options depend on selected Department
- **Product Details**: See detailed info, images, and reviews for each product
- **Shopping Cart**: Add, update, and remove items; persistent across sessions
- **Checkout**: Secure Stripe payment integration
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
- **Order Management**: View all orders in the system, see user emails, and inspect order details with product images
- **Orders: Details + Actions Columns**: View stays under Details; Edit/Delete are grouped under Actions
- **Order Status Edit Flow**: “Edit” opens details in edit mode for updating status
- **Modern Admin UI**: Icon-based action buttons and consistent spacing across admin tables
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
- **Favorites**:
  - `GET /api/favorites/my/ids`
  - `GET /api/favorites/my`
  - `POST /api/favorites/toggle`
  - `POST /api/favorites`
  - `DELETE /api/favorites/:productId`

---

## 🛡️ Security & Best Practices

- Passwords are never returned from the API responses
- Session cookies are HTTP-only and sent via `credentials: 'include'`
- For a production deployment, you should:
  - Hash passwords (e.g., `bcrypt`) instead of storing plain text
  - Move the session secret and other secrets fully into `.env`
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

- **Admin Orders page**: Admin/manager can view all orders, see user emails, and inspect order details with product images (new!)

### Whole Project

- **Product Metadata**: Add additional product fields (e.g., brand/company)
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
