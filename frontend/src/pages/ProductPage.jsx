import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import ProductSearchBar from '../components/common/ProductSearchBar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CaretDownIcon = ({ style }) => (
    <svg style={style} width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

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

    // Filter categories based on selected department (use numbers for comparison)
    const filteredCategories = selectedDepartment === 'all'
        ? []
        : categories.filter(cat => parseInt(cat.department_id) === parseInt(selectedDepartment));

    // Dropdown with search for departments and categories
    const [dropdownOpen, setDropdownOpen] = useState(null); // 'department' | 'category' | null
    const [dropdownSearch, setDropdownSearch] = useState('');
    const departmentDropdownRef = useRef();
    const categoryDropdownRef = useRef();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (
                (dropdownOpen === 'department' && departmentDropdownRef.current && !departmentDropdownRef.current.contains(e.target)) ||
                (dropdownOpen === 'category' && categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target))
            ) {
                setDropdownOpen(null);
                setDropdownSearch('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen]);

    // Filtered options
    const filteredDepartmentOptions = departments.filter(dep => dep.name.toLowerCase().includes(dropdownOpen === 'department' ? dropdownSearch.toLowerCase() : ''));
    const filteredCategoryOptions = filteredCategories.filter(cat => cat.name.toLowerCase().includes(dropdownOpen === 'category' ? dropdownSearch.toLowerCase() : ''));

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
                maxWidth: 700,
                marginLeft: 'auto',
                marginRight: 'auto',
            }}>
                <ProductSearchBar
                    search={search}
                    setSearch={setSearch}
                />
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 32,
                width: '100%',
                maxWidth: 700,
                marginLeft: 'auto',
                marginRight: 'auto',
            }}>
                {/* Department Dropdown */}
                <div ref={departmentDropdownRef} style={{ position: 'relative', minWidth: 140, height: 44, flex: '0 0 140px', zIndex: 2 }}>
                    <button
                        style={{
                            height: 44,
                            minWidth: 140,
                            padding: '0 1rem',
                            borderRadius: 0,
                            borderTop: '1.5px solid #b3c6e0',
                            borderBottom: '1.5px solid #b3c6e0',
                            borderRight: 'none',
                            borderLeft: 'none',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            outline: dropdownOpen === 'department' ? '2px solid #cce4ff' : undefined
                        }}
                        onClick={() => {
                            setDropdownOpen(dropdownOpen === 'department' ? null : 'department');
                            setDropdownSearch('');
                        }}
                        tabIndex={0}
                        aria-haspopup="listbox"
                        aria-expanded={dropdownOpen === 'department'}
                    >
                        <span>{selectedDepartment === 'all' ? 'All Departments' : departments.find(dep => dep.id === parseInt(selectedDepartment))?.name || 'Select Department'}</span>
                        <CaretDownIcon style={{ marginLeft: 8, transition: 'transform 0.2s', transform: dropdownOpen === 'department' ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {dropdownOpen === 'department' && (
                        <div style={{ position: 'absolute', top: 38, left: 0, width: 180, background: '#fff', border: '1.5px solid #007bff', borderRadius: 6, zIndex: 10, boxShadow: '0 4px 16px rgba(0,123,255,0.10)' }}>
                            <input
                                type="text"
                                placeholder="Search department..."
                                value={dropdownSearch}
                                onChange={e => setDropdownSearch(e.target.value)}
                                style={{ width: '100%', padding: '6px 8px', border: 'none', borderBottom: '1px solid #eee', borderRadius: '6px 6px 0 0', outline: 'none' }}
                                autoFocus
                            />
                            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                                <div
                                    style={{ padding: '8px', cursor: 'pointer', color: '#007bff', background: selectedDepartment === 'all' ? '#e6f0ff' : undefined, fontWeight: selectedDepartment === 'all' ? 'bold' : undefined, transition: 'background 0.2s' }}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => { setSelectedDepartment('all'); setDropdownOpen(null); setDropdownSearch(''); setSelectedCategory('all'); }}
                                >All Departments</div>
                                {filteredDepartmentOptions.map(dep => (
                                    <div
                                        key={dep.id}
                                        style={{
                                            padding: '8px',
                                            cursor: 'pointer',
                                            background: selectedDepartment === String(dep.id) ? '#e6f0ff' : undefined,
                                            fontWeight: selectedDepartment === String(dep.id) ? 'bold' : undefined,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => { setSelectedDepartment(String(dep.id)); setDropdownOpen(null); setDropdownSearch(''); setSelectedCategory('all'); }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f0f8ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = selectedDepartment === String(dep.id) ? '#e6f0ff' : '#fff'}
                                    >{dep.name}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {/* Category Dropdown */}
                <div ref={categoryDropdownRef} style={{ position: 'relative', minWidth: 140, height: 44, flex: '0 0 140px', zIndex: 1, marginLeft: '-1.5px' }}>
                    <button
                        style={{
                            height: 44,
                            minWidth: 140,
                            padding: '0 1rem',
                            borderRadius: '0 8px 8px 0',
                            borderTop: '1.5px solid #b3c6e0',
                            borderBottom: '1.5px solid #b3c6e0',
                            borderLeft: 'none',
                            borderRight: '1.5px solid #b3c6e0',
                            background: '#fff',
                            cursor: selectedDepartment === 'all' ? 'not-allowed' : 'pointer',
                            fontSize: 16,
                            color: selectedDepartment === 'all' ? '#aaa' : undefined,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            outline: dropdownOpen === 'category' ? '2px solid #cce4ff' : undefined
                        }}
                        onClick={() => {
                            if (selectedDepartment === 'all') return;
                            setDropdownOpen(dropdownOpen === 'category' ? null : 'category');
                            setDropdownSearch('');
                        }}
                        disabled={selectedDepartment === 'all'}
                        tabIndex={0}
                        aria-haspopup="listbox"
                        aria-expanded={dropdownOpen === 'category'}
                    >
                        <span>{selectedCategory === 'all' ? 'All Categories' : filteredCategories.find(cat => cat.id === parseInt(selectedCategory))?.name || 'Select Category'}</span>
                        <CaretDownIcon style={{ marginLeft: 8, transition: 'transform 0.2s', transform: dropdownOpen === 'category' ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {dropdownOpen === 'category' && (
                        <div style={{ position: 'absolute', top: 38, left: 0, width: 180, background: '#fff', border: '1.5px solid #007bff', borderRadius: 6, zIndex: 10, boxShadow: '0 4px 16px rgba(0,123,255,0.10)' }}>
                            <input
                                type="text"
                                placeholder="Search category..."
                                value={dropdownSearch}
                                onChange={e => setDropdownSearch(e.target.value)}
                                style={{ width: '100%', padding: '6px 8px', border: 'none', borderBottom: '1px solid #eee', borderRadius: '6px 6px 0 0', outline: 'none' }}
                                autoFocus
                            />
                            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                                <div
                                    style={{ padding: '8px', cursor: 'pointer', color: '#007bff', background: selectedCategory === 'all' ? '#e6f0ff' : undefined, fontWeight: selectedCategory === 'all' ? 'bold' : undefined, transition: 'background 0.2s' }}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => { setSelectedCategory('all'); setDropdownOpen(null); setDropdownSearch(''); }}
                                >All Categories</div>
                                {filteredCategoryOptions.map(cat => (
                                    <div
                                        key={cat.id}
                                        style={{
                                            padding: '8px',
                                            cursor: 'pointer',
                                            background: selectedCategory === String(cat.id) ? '#e6f0ff' : undefined,
                                            fontWeight: selectedCategory === String(cat.id) ? 'bold' : undefined,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => { setSelectedCategory(String(cat.id)); setDropdownOpen(null); setDropdownSearch(''); }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f0f8ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = selectedCategory === String(cat.id) ? '#e6f0ff' : '#fff'}
                                    >{cat.name}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="product-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2rem',
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
    );
};

export default ProductPage;
