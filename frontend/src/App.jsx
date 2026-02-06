import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import Stripe Elements and loadStripe for Stripe context
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Home from './pages/Home';
import DepartmentList from './pages/admin/departments/DepartmentList';
import UpsertDepartment from './pages/admin/departments/UpsertDepartment';
import CategoryList from './pages/admin/categories/CategoryList';
import UpsertCategory from './pages/admin/categories/UpsertCategory';
import ProductList from './pages/admin/products/ProductList';
import UpsertProduct from './pages/admin/products/UpsertProduct';
import UserList from './pages/admin/users/UserList';
import UpsertUser from './pages/admin/users/UpsertUser';
import ReviewList from './pages/admin/reviews/ReviewList';
import UpsertReview from './pages/admin/reviews/UpsertReview';
import OrderList from './pages/admin/orders/OrderList';
import UserOrderDetails from './pages/admin/orders/UserOrderDetails';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/auth/LoginPage'; // ✅ Added Login Page
import RegisterPage from './pages/auth/RegisterPage'; // ✅ Added User Registration Page
import AdminRegisterPage from './pages/auth/AdminRegisterPage'; // ✅ Added Manager Registration Page
import PrivateRoute from './pages/auth/PrivateRoute'; // ✅ Added Protected Route Logic
import { AuthProvider } from './context/AuthContext'; // ✅ Added Authentication Context
import { FavoritesProvider } from './context/FavoritesContext';
import ProductPage from './pages/ProductPage';
import ProductInfoPage from './pages/ProductInfoPage';
import ShoppingCartPage from './pages/ShoppingCartPage';
import CheckoutPage from './pages/CheckoutPage'; // Import CheckoutPage for Stripe payment integration
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrdersPage from './pages/MyOrdersPage';
import MyFavoritesPage from './pages/MyFavoritesPage';
import MyReviewsPage from './pages/MyReviewsPage';
import MyProfile from './pages/MyProfile';
import OrderDetailsPage from './pages/OrderDetailsPage';

// Initialize Stripe with your publishable key (safe for frontend)
const stripePromise = loadStripe('pk_test_51RbrrTQDAYM6vQvxYur66oTn8OVcvLDsXj3HG1VCW2lDX4ZlaEdwfv8vvGEUUwwUAkH8jShEU3vzG6VrrpNDFhUV0016IMOnlA');

function App() {
    return (
        // Provide authentication context to the app
        <AuthProvider>
            <FavoritesProvider>
                <Router>
                    {/* Wrap the app in <Elements> to provide Stripe context to all components */}
                    <Elements stripe={stripePromise}>
                        <Navbar />
                        <Routes>
                            {/* Main and admin routes */}
                            <Route path="/" element={<Home />} />
                        <Route path="/admin/departments" element={<DepartmentList />} />
                        <Route path="/admin/departments/upsert" element={<UpsertDepartment />} />
                        <Route path="/admin/departments/upsert/:id" element={<UpsertDepartment />} />

                        <Route path="/admin/categories" element={<CategoryList />} />
                        <Route path="/admin/categories/upsert" element={<UpsertCategory />} />
                        <Route path="/admin/categories/upsert/:id" element={<UpsertCategory />} />

                        <Route path="/admin/products" element={<ProductList />} />
                        <Route path="/admin/products/upsert" element={<UpsertProduct />} />
                        <Route path="/admin/products/upsert/:id" element={<UpsertProduct />} />

                        <Route path="/admin/users" element={<UserList />} />
                        <Route path="/admin/users/upsert" element={<UpsertUser />} />
                        <Route path="/admin/users/upsert/:id" element={<UpsertUser />} />

                        <Route path="/admin/reviews" element={<ReviewList />} />
                        <Route path="/admin/reviews/upsert" element={<UpsertReview />} />
                        <Route path="/admin/reviews/upsert/:id" element={<UpsertReview />} />

                        <Route path="/admin/orders" element={<PrivateRoute element={<OrderList />} />} />
                        <Route path="/admin/orders/:orderId" element={<PrivateRoute element={<UserOrderDetails />} />} />


                        {/* ✅ Authentication Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/admin/register" element={<PrivateRoute element={<AdminRegisterPage />} />} />

                        {/* Public Product Routes */}
                        <Route path="/products" element={<ProductPage />} />
                        <Route path="/products/:id" element={<ProductInfoPage />} />
                        <Route path="/cart" element={<ShoppingCartPage />} />
                        <Route path="/my-orders" element={<MyOrdersPage />} />
                        <Route path="/my-favorites" element={<MyFavoritesPage />} />
                        <Route path="/my-reviews" element={<MyReviewsPage />} />
                        <Route path="/my-profile" element={<MyProfile />} />
                        <Route path="/order-details/:id" element={<OrderDetailsPage />} />
                        {/* Stripe Checkout Route for payment */}
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-confirmation" element={<OrderConfirmation />} />
                        </Routes>
                    </Elements>
                </Router>
            </FavoritesProvider>
        </AuthProvider>
    );
}

export default App;
