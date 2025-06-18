import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DepartmentList from './pages/admin/departments/DepartmentList';
import UpsertDepartment from './pages/admin/departments/UpsertDepartment';
import CategoryList from './pages/admin/categories/CategoryList';
import UpsertCategory from './pages/admin/categories/UpsertCategory';
import ProductList from './pages/admin/products/ProductList';
import UpsertProduct from './pages/admin/products/UpsertProduct';
import UserList from './pages/admin/users/UserList';
import UpsertUser from './pages/admin/users/UpsertUser';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/auth/LoginPage'; // ✅ Added Login Page
import RegisterPage from './pages/auth/RegisterPage'; // ✅ Added User Registration Page
import AdminRegisterPage from './pages/auth/AdminRegisterPage'; // ✅ Added Manager Registration Page
import PrivateRoute from './pages/auth/PrivateRoute'; // ✅ Added Protected Route Logic
import { AuthProvider } from './context/AuthContext'; // ✅ Added Authentication Context
import ProductPage from './pages/ProductPage';
import ProductInfoPage from './pages/ProductInfoPage';
import ShoppingCartPage from './pages/ShoppingCartPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
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

                    {/* ✅ Authentication Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/admin/register" element={<PrivateRoute element={<AdminRegisterPage />} />} />

                    {/* Public Product Routes */}
                    <Route path="/products" element={<ProductPage />} />
                    <Route path="/products/:id" element={<ProductInfoPage />} />
                    <Route path="/cart" element={<ShoppingCartPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
