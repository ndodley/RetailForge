import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import AdvancedSearchPanel from '../components/common/AdvancedSearchPanel';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [sortBy, setSortBy] = useState('best');
    const [sortOrder, setSortOrder] = useState('asc');
    const [stockFilter, setStockFilter] = useState('any'); // any | in | out
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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

    const availableCategories = useMemo(() => {
        if (selectedDepartment === 'all') return [];
        return categories.filter((cat) => Number(cat.department_id) === Number(selectedDepartment));
    }, [categories, selectedDepartment]);

    const departmentOptions = useMemo(() => {
        const opts = [{ value: 'all', label: 'Any' }];
        const sorted = [...departments].sort((a, b) => String(a.name).localeCompare(String(b.name)));
        sorted.forEach((d) => opts.push({ value: String(d.id), label: d.name }));
        return opts;
    }, [departments]);

    const categoryOptions = useMemo(() => {
        const opts = [{ value: 'all', label: 'Any' }];
        const sorted = [...availableCategories].sort((a, b) => String(a.name).localeCompare(String(b.name)));
        sorted.forEach((c) => opts.push({ value: String(c.id), label: c.name }));
        return opts;
    }, [availableCategories]);

    const filterSections = useMemo(() => {
        return [
            {
                key: 'sort',
                title: 'Sort',
                type: 'radio',
                value: sortBy,
                onChange: (v) => setSortBy(String(v)),
                options: [
                    { value: 'best', label: 'Best Match' },
                    { value: 'alpha', label: 'Alphabet' },
                    { value: 'price', label: 'Price' },
                    { value: 'stock', label: 'Stock' },
                ],
            },
            {
                key: 'order',
                title: 'Order',
                type: 'radio',
                value: sortOrder,
                onChange: (v) => setSortOrder(String(v)),
                options: [
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' },
                ],
            },
            {
                key: 'department',
                title: 'Department',
                type: 'radio',
                value: selectedDepartment,
                onChange: (v) => {
                    const next = String(v);
                    setSelectedDepartment(next);
                    setSelectedCategory('all');
                },
                options: departmentOptions,
            },
            {
                key: 'category',
                title: 'Category',
                type: 'radio',
                value: selectedCategory,
                onChange: (v) => setSelectedCategory(String(v)),
                options: categoryOptions,
            },
            {
                key: 'stock',
                title: 'In Stock',
                type: 'radio',
                value: stockFilter,
                onChange: (v) => setStockFilter(String(v)),
                options: [
                    { value: 'any', label: 'Any' },
                    { value: 'in', label: 'True' },
                    { value: 'out', label: 'False' },
                ],
            },
        ];
    }, [categoryOptions, departmentOptions, selectedCategory, selectedDepartment, sortBy, sortOrder, stockFilter]);

    useEffect(() => {
        let filtered = products;
        // Filter by department using category lookup
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(p => {
                const category = categories.find((c) => Number(c.id) === Number(p.category_id));
                return category && Number(category.department_id) === Number(selectedDepartment);
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

        if (stockFilter === 'in') {
            filtered = filtered.filter(p => Number(p.stock || 0) > 0);
        }
        if (stockFilter === 'out') {
            filtered = filtered.filter(p => Number(p.stock || 0) <= 0);
        }

        const multiplier = sortOrder === 'asc' ? 1 : -1;
        filtered = [...filtered].sort((a, b) => {
            if (sortBy === 'alpha') return multiplier * String(a.name).localeCompare(String(b.name));
            if (sortBy === 'price') return multiplier * (Number(a.price || 0) - Number(b.price || 0));
            if (sortBy === 'stock') return multiplier * (Number(a.stock || 0) - Number(b.stock || 0));
            return 0; // Best Match keeps API order
        });

        setFilteredProducts(filtered);
    }, [search, selectedCategory, selectedDepartment, products, categories, sortBy, sortOrder, stockFilter]);

    const handleAddToCart = async (product) => {
        if (!user) {
            // Redirect to login and preserve current location (use pathname only)
            navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } }, replace: true });
            return;
        }
        try {
            // 1. Get or create cart for user
            const cartRes = await axios.get(`http://localhost:5000/api/cart/user/${user.id}`);
            const cart = cartRes.data;
            // 2. Add item to cart (default quantity 1)
            await axios.post('http://localhost:5000/api/cart/item', {
                cart_id: cart.id,
                product_id: product.id,
                quantity: 1
            });
            alert(`Added ${product.name} to cart!`);
        } catch (err) {
            alert('Failed to add to cart.');
        }
    };

    if (loading) return <div className="product-loading">Loading products...</div>;
    if (error) return <div className="product-error">{error}</div>;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--app-bg)',
            padding: 0,
        }}>
            <div className="product-page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Shop All Products</h2>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    marginBottom: 24,
                    width: '100%',
                    maxWidth: 900,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}>
                    <AdvancedSearchPanel
                        title="Advanced Search"
                        query={search}
                        onQueryChange={setSearch}
                        isOpen={filtersOpen}
                        onToggleOpen={() => setFiltersOpen((v) => !v)}
                        onSearch={() => setFiltersOpen(false)}
                        sections={filterSections}
                    />
                </div>
                <div className="product-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, 240px)',
                    gap: '2rem',
                    justifyContent: 'center',
                }}>
                    {filteredProducts.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>No products found.</div>
                    ) : (
                        filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
