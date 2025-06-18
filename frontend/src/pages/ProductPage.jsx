import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import ProductSearchBar from '../components/common/ProductSearchBar';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:5000/api/products').then(res => res.json()),
            fetch('http://localhost:5000/api/categories').then(res => res.json()),
            fetch('http://localhost:5000/api/departments').then(res => res.json())
        ])
            .then(([productsData, categoriesData, departmentsData]) => {
                setProducts(productsData);
                setFilteredProducts(productsData);
                setCategories(categoriesData);
                setDepartments(departmentsData);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load products, categories, or departments');
                setLoading(false);
            });
    }, []);

    // Filter categories based on selected department (use numbers for comparison)
    const filteredCategories = selectedDepartment === 'all'
        ? []
        : categories.filter(cat => parseInt(cat.department_id) === parseInt(selectedDepartment));

    useEffect(() => {
        let filtered = products;
        // Filter by department using category lookup
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(p => {
                const category = categories.find(c => c.id === p.category_id);
                return category && category.department_id === parseInt(selectedDepartment);
            });
        }
        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category_id === parseInt(selectedCategory));
        }
        // Filter by search
        if (search.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredProducts(filtered);
    }, [search, selectedCategory, selectedDepartment, products, categories]);

    if (loading) return <div className="product-loading">Loading products...</div>;
    if (error) return <div className="product-error">{error}</div>;

    return (
        <div className="product-page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Shop All Products</h2>
            <ProductSearchBar
                search={search}
                setSearch={setSearch}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                categories={filteredCategories}
                departments={departments}
            />
            <div className="product-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2rem',
            }}>
                {filteredProducts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>No products found.</div>
                ) : (
                    filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductPage;
