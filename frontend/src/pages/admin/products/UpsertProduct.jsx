import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/AdminLayout';
import BulkUploadSection from '../../../components/admin/BulkUploadSection';
import { productCsv } from '../../../utils/adminCsvSchemas';

const UpsertProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const emptyForm = useMemo(() => ({
        name: '',
        brand: '',
        rating: 0,
        description: '',
        price: '',
        stock: '',
        category_id: '',
        department_id: '',
    }), []);
    const [formData, setFormData] = useState({
        ...emptyForm
    });
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]); // Add departments state
    const [imageFile, setImageFile] = useState(null);
    const [currentImagePath, setCurrentImagePath] = useState('');

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
        ? categories.filter(cat => Number(cat.department_id) === Number(formData.department_id))
        : categories;

    // ✅ Fetch product data if editing
    useEffect(() => {
        if (!id) {
            setFormData({ ...emptyForm });
            setCurrentImagePath('');
            setImageFile(null);
            return;
        }

        axios.get(`http://localhost:5000/api/products/${id}`)
            .then((response) => {
                const p = response.data || {};
                const categoryId = p.category_id ? String(p.category_id) : '';
                setCurrentImagePath(p.image_path ? String(p.image_path) : '');
                setFormData({
                    ...emptyForm,
                    name: p.name ?? '',
                    brand: p.brand ?? '',
                    rating: p.rating ?? 0,
                    description: p.description ?? '',
                    price: p.price ?? '',
                    stock: p.stock ?? '',
                    category_id: categoryId,
                    department_id: '',
                });
            })
            .catch((error) => console.error('❌ Error fetching product:', error));
    }, [emptyForm, id]);

    // If categories arrive after the product, derive department_id from category_id
    useEffect(() => {
        if (!id) return;
        if (formData.department_id) return;
        if (!formData.category_id) return;
        if (!categories.length) return;

        const category = categories.find((c) => String(c.id) === String(formData.category_id));
        if (!category) return;

        setFormData((prev) => ({
            ...prev,
            department_id: String(category.department_id || ''),
        }));
    }, [categories, formData.category_id, formData.department_id, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

                    <div className="admin-field">
                        <div className="admin-label">Name</div>
                        <input
                            className="admin-input"
                            type="text"
                            name="name"
                            value={formData.name ?? ''}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Brand (optional)</div>
                        <input
                            className="admin-input"
                            type="text"
                            name="brand"
                            value={formData.brand ?? ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Rating (0–5)</div>
                        <input
                            className="admin-input"
                            type="number"
                            name="rating"
                            min={0}
                            max={5}
                            step={0.1}
                            value={formData.rating ?? 0}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                        <div className="admin-label">Description</div>
                        <textarea
                            className="admin-textarea"
                            name="description"
                            value={formData.description ?? ''}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Price</div>
                        <input
                            className="admin-input"
                            type="number"
                            name="price"
                            value={formData.price ?? ''}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Stock</div>
                        <input
                            className="admin-input"
                            type="number"
                            name="stock"
                            value={formData.stock ?? ''}
                            onChange={handleChange}
                            required
                        />
                    </div>

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

                    {id && (
                        <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                            <div className="admin-label">Current Image</div>
                            {currentImagePath ? (
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <img
                                        src={`http://localhost:5000${currentImagePath}`}
                                        alt="Current product"
                                        width="84"
                                        height="84"
                                        style={{ objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                                        onError={(e) => {
                                            e.currentTarget.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
                                        }}
                                    />
                                    <input
                                        className="admin-input"
                                        type="text"
                                        value={currentImagePath}
                                        readOnly
                                        style={{ flex: '1 1 420px' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ color: 'var(--muted)', fontWeight: 700 }}>No current image path.</div>
                            )}
                        </div>
                    )}
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

            {!id ? (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                    <BulkUploadSection
                        title="Bulk Upload"
                        description="Upload a products CSV to create multiple products. image_path is optional."
                        columns={productCsv.columns}
                        filename={productCsv.filename}
                        uploadUrl="http://localhost:5000/api/products/bulk"
                    />
                </div>
            ) : null}
        </AdminLayout>
    );
};

export default UpsertProduct;
