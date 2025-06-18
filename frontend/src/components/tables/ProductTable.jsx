import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [filteredProducts, setFilteredProducts] = useState([]);
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

    // Filter categories based on selected department
    const filteredCategories = selectedDepartment === 'all'
        ? []
        : categories.filter(cat => parseInt(cat.department_id) === parseInt(selectedDepartment));

    // Filter products based on department and category
    useEffect(() => {
        let filtered = products;
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(p => {
                const category = categories.find(c => c.id === p.category_id);
                return category && category.department_id === parseInt(selectedDepartment);
            });
        }
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category_id === parseInt(selectedCategory));
        }
        setFilteredProducts(filtered);
    }, [products, categories, selectedDepartment, selectedCategory]);

    return (
        <div>
            <h2>Product List</h2>
            {/* Department and Category Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <select
                    value={selectedDepartment}
                    onChange={e => {
                        setSelectedDepartment(e.target.value);
                        setSelectedCategory('all');
                    }}
                >
                    <option value="all">All Departments</option>
                    {departments.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                </select>
                {selectedDepartment !== 'all' ? (
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {filteredCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                ) : null}
            </div>
            <button onClick={() => navigate('/admin/products/upsert')}>Add New Product</button>

            {filteredProducts.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Category</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.description || 'No description'}</td>
                                <td>${product.price}</td>
                                <td>{product.stock}</td>
                                <td>{product.category_name || 'Unassigned'}</td>
                                <td>
                                    {product.image_path ? (
                                        <img
                                            src={`http://localhost:5000${product.image_path}`}
                                            alt={product.name}
                                            width="50"
                                            height="50"
                                            onError={(e) => {
                                                e.target.src = '/images/other_images/dummy_product.jpg';
                                            }}
                                        />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => navigate(`/admin/products/upsert/${product.id}`)}>Edit</button>
                                    <button onClick={() => handleDelete(product.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No products found.</p>
            )}
        </div>
    );
};

export default ProductTable;
