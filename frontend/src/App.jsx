import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DepartmentList from './pages/admin/departments/DepartmentList';
import UpsertDepartment from './pages/admin/departments/UpsertDepartment';
import CategoryList from './pages/admin/categories/CategoryList';
import UpsertCategory from './pages/admin/categories/UpsertCategory';
import ProductList from './pages/admin/products/ProductList';
import UpsertProduct from './pages/admin/products/UpsertProduct';
import Navbar from './components/common/Navbar';

function App() {
    return (
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
            </Routes>
        </Router>
    );
}

export default App;
