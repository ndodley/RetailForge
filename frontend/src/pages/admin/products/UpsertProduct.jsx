import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        <div>
            <h2>{id ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
                {/* Department Dropdown */}
                <label>
                    Department:
                    <select
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
                </label>
                {/* Category Dropdown (filtered by department) */}
                <label>
                    Category:
                    <select
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
                </label>

                {Object.keys(formData).map((key) => (
                    key !== "category_id" && key !== "department_id" && (
                        <label key={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}:
                            <input
                                type={key === 'price' || key === 'stock' ? 'number' : 'text'}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    )
                ))}

                <label>
                    Image (optional):
                    <input
                        type="file"
                        name="image"
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
                    />
                </label>

                <button type="submit">{id ? 'Update Product' : 'Add Product'}</button>
                <button type="button" onClick={() => navigate('/admin/products')}>Go Back</button> {/* ✅ Added Go Back */}
            </form>
        </div>
    );
};

export default UpsertProduct;
