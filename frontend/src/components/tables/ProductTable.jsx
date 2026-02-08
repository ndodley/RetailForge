import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdvancedSearchPanel from '../common/AdvancedSearchPanel';
import { downloadCsv } from '../../utils/csv';
import { productCsv, mapToCsvRows } from '../../utils/adminCsvSchemas';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('best');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch product, department, and category lists from backend
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [productsRes, departmentsRes, categoriesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/products'),
                    axios.get('http://localhost:5000/api/departments'),
                    axios.get('http://localhost:5000/api/categories'),
                ]);
                setProducts(productsRes.data);
                setDepartments(departmentsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('❌ Error fetching data:', error);
            }
        };
        fetchAll();
    }, []);

    // Handle delete without page reload
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`);
            setProducts((prev) => prev.filter((product) => product.id !== id));
        } catch (error) {
            console.error('❌ Error deleting product:', error);
        }
    };

    const departmentOptions = useMemo(() => {
        const opts = [{ value: 'all', label: 'All Departments' }];
        const sorted = [...departments].sort((a, b) => String(a.name).localeCompare(String(b.name)));
        sorted.forEach((d) => opts.push({ value: String(d.id), label: d.name }));
        return opts;
    }, [departments]);

    const availableCategories = useMemo(() => {
        if (selectedDepartment === 'all') return [];
        return categories.filter((cat) => Number(cat.department_id) === Number(selectedDepartment));
    }, [categories, selectedDepartment]);

    const categoryOptions = useMemo(() => {
        const opts = [{ value: 'all', label: 'All Categories' }];
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
                options: selectedDepartment === 'all' ? [{ value: 'all', label: 'All Categories' }] : categoryOptions,
            },
        ];
    }, [categoryOptions, departmentOptions, selectedCategory, selectedDepartment, sortBy, sortOrder]);

    // Filter products based on department and category
    useEffect(() => {
        let filtered = products;
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(p => {
                const category = categories.find((c) => Number(c.id) === Number(p.category_id));
                return category && Number(category.department_id) === Number(selectedDepartment);
            });
        }
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((p) => Number(p.category_id) === Number(selectedCategory));
        }

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            filtered = filtered.filter((p) => {
                const name = String(p.name || '').toLowerCase();
                const description = String(p.description || '').toLowerCase();
                const brand = String(p.brand || '').toLowerCase();
                return name.includes(q) || description.includes(q) || brand.includes(q);
            });
        }

        const multiplier = sortOrder === 'asc' ? 1 : -1;
        filtered = [...filtered].sort((a, b) => {
            if (sortBy === 'alpha') return multiplier * String(a.name).localeCompare(String(b.name));
            if (sortBy === 'price') return multiplier * (Number(a.price || 0) - Number(b.price || 0));
            if (sortBy === 'stock') return multiplier * (Number(a.stock || 0) - Number(b.stock || 0));
            return 0;
        });

        setFilteredProducts(filtered);
    }, [products, categories, selectedDepartment, selectedCategory, search, sortBy, sortOrder]);

    return (
        <div>
            <div style={{ maxWidth: 980 }}>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0' }}>
                <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={() => downloadCsv({
                        rows: mapToCsvRows(productCsv, filteredProducts),
                        filename: productCsv.filename,
                        columns: productCsv.columns,
                    })}
                    disabled={filteredProducts.length === 0}
                    title={filteredProducts.length === 0 ? 'No data to export' : 'Download CSV'}
                >
                    Download CSV
                </button>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="admin-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 220 }}>Name</th>
                                <th style={{ width: 180 }}>Brand</th>
                                <th style={{ width: 120 }}>Rating</th>
                                <th>Description</th>
                                <th style={{ width: 140 }}>Price</th>
                                <th style={{ width: 120 }}>Stock</th>
                                <th style={{ width: 220 }}>Category</th>
                                <th style={{ width: 120 }}>Image</th>
                                <th style={{ width: 220 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td style={{ fontWeight: 900 }}>{product.name}</td>
                                    <td style={{ fontWeight: 800 }}>{product.brand || '—'}</td>
                                    <td style={{ fontWeight: 800 }}>{Number(product.rating || 0).toFixed(1)}</td>
                                    <td style={{ color: 'var(--muted)' }}>{product.description || 'No description'}</td>
                                    <td style={{ fontWeight: 900 }}>${product.price}</td>
                                    <td style={{ fontWeight: 800 }}>{product.stock}</td>
                                    <td style={{ fontWeight: 800 }}>{product.category_name || 'Unassigned'}</td>
                                    <td>
                                        {product.image_path ? (
                                            <img
                                                src={`http://localhost:5000${product.image_path}`}
                                                alt={product.name}
                                                width="52"
                                                height="52"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.src = '/images/other_images/dummy_product.jpg';
                                                }}
                                            />
                                        ) : (
                                            <span style={{ color: 'var(--muted)', fontWeight: 700 }}>No Image</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <button className="admin-btn admin-btn--sm" onClick={() => navigate(`/admin/products/upsert/${product.id}`)}>
                                                <span className="admin-action-icon" aria-hidden="true">✎</span>
                                                Edit
                                            </button>
                                            <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(product.id)}>
                                                <span className="admin-action-icon" aria-hidden="true">✕</span>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No products found.</div>
            )}
        </div>
    );
};

export default ProductTable;
