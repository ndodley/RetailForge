import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/AdminLayout';

const UpsertProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        department_id: '', // Add department_id to formData
    });
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]); // Add departments state
    const [imageFile, setImageFile] = useState(null);

    // ✅ Fetch departments for dropdown
    useEffect(() => {
        axios.get('http://localhost:5000/api/departments')
            .then((response) => setDepartments(response.data))
            .catch((error) => console.error('❌ Error fetching departments:', error));
    }, []);

    // ✅ Fetch categories for dropdown (filtered by department)
    useEffect(() => {
        axios.get('http://localhost:5000/api/categories')
            .then((response) => setCategories(response.data))
            .catch((error) => console.error('❌ Error fetching categories:', error));
    }, []);

    // Filter categories by selected department
    const filteredCategories = formData.department_id
        ? categories.filter(cat => parseInt(cat.department_id) === parseInt(formData.department_id))
        : categories;

    // ✅ Fetch product data if editing
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/api/products/${id}`)
                .then((response) => setFormData(response.data))
                .catch((error) => console.error('❌ Error fetching product:', error));
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataToSend.append(key, value);
        });

        if (imageFile) {
            formDataToSend.append('image', imageFile); // ✅ Sends an empty string if no image is uploaded
        }

        for (let pair of formDataToSend.entries()) {
            console.log(`🔍 FormData entry: ${pair[0]} = ${pair[1]}`);
        }

        try {
            const url = id ? `http://localhost:5000/api/products/${id}` : 'http://localhost:5000/api/products';
            const method = id ? 'put' : 'post';

            await axios({
                method,
                url,
                data: formDataToSend,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/admin/products'); // ✅ Navigates to product list page
        } catch (error) {
            console.error('❌ Error saving product:', error);
        }
    };

    return (
        <AdminLayout
            title={id ? 'Edit Product' : 'Add New Product'}
            subtitle="Products appear in the store catalog and can include an optional image."
        >
            <form onSubmit={handleSubmit}>
                <div className="admin-field-grid">
                    <div className="admin-field">
                        <div className="admin-label">Department</div>
                        <select
                            className="admin-select"
                            name="department_id"
                            value={formData.department_id || ''}
                            onChange={e => {
                                setFormData({ ...formData, department_id: e.target.value, category_id: '' });
                            }}
                            required
                        >
                            <option value="">Select a department</option>
                            {departments.map(dep => (
                                <option key={dep.id} value={dep.id}>{dep.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Category</div>
                        <select
                            className="admin-select"
                            name="category_id"
                            value={formData.category_id || ''}
                            onChange={handleChange}
                            required
                            disabled={!formData.department_id}
                        >
                            <option value="">Select a category</option>
                            {filteredCategories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    {Object.keys(formData).map((key) => (
                        key !== 'category_id' && key !== 'department_id' && (
                            <div key={key} className="admin-field" style={key === 'description' ? { gridColumn: '1 / -1' } : undefined}>
                                <div className="admin-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                                {key === 'description' ? (
                                    <textarea
                                        className="admin-textarea"
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleChange}
                                        required
                                    />
                                ) : (
                                    <input
                                        className="admin-input"
                                        type={key === 'price' || key === 'stock' ? 'number' : 'text'}
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleChange}
                                        required
                                    />
                                )}
                            </div>
                        )
                    ))}

                    <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                        <div className="admin-label">Image (optional)</div>
                        <input
                            className="admin-input"
                            type="file"
                            name="image"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="admin-actions" style={{ marginTop: 14 }}>
                    <button className="admin-btn admin-btn--primary" type="submit">
                        {id ? 'Update Product' : 'Add Product'}
                    </button>
                    <button className="admin-btn" type="button" onClick={() => navigate('/admin/products')}>
                        Go Back
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
};

export default UpsertProduct;
