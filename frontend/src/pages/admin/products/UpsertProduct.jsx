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
    });
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    // ✅ Fetch categories for dropdown
    useEffect(() => {
        axios.get('http://localhost:5000/api/categories')
            .then((response) => setCategories(response.data))
            .catch((error) => console.error('❌ Error fetching categories:', error));
    }, []);

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
                {Object.keys(formData).map((key) => (
                    key !== "category_id" && (
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
                    Category:
                    <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>

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
