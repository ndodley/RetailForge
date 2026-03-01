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
    const [page, setPage] = useState(1);
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const pageSize = 8;

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

    useEffect(() => {
        setPage(1);
    }, [filteredProducts.length]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const pagedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize);

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

                {filteredProducts.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: 16,
                    }}>
                        <div style={{ color: 'var(--muted-2)', fontWeight: 800 }}>
                            Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredProducts.length)} of {filteredProducts.length}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                                type="button"
                                disabled={safePage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                style={{
                                    background: 'var(--surface-3)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '10px 12px',
                                    fontWeight: 900,
                                    cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                                    opacity: safePage <= 1 ? 0.6 : 1,
                                }}
                            >
                                Prev
                            </button>

                            <div style={{ color: 'var(--muted-2)', fontWeight: 900 }}>
                                Page {safePage} / {totalPages}
                            </div>

                            <button
                                type="button"
                                disabled={safePage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                style={{
                                    background: 'var(--surface-3)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '10px 12px',
                                    fontWeight: 900,
                                    cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                                    opacity: safePage >= totalPages ? 0.6 : 1,
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                <div className="product-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: 18,
                    alignItems: 'stretch',
                }}>
                    {filteredProducts.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>No products found.</div>
                    ) : (
                        pagedProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
