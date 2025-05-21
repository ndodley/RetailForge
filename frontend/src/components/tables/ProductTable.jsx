import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    // ✅ Fetch product list from backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setProducts(response.data);
            } catch (error) {
                console.error('❌ Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    // ✅ Handle delete without page reload
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`);
            setProducts((prev) => prev.filter((product) => product.id !== id));
        } catch (error) {
            console.error('❌ Error deleting product:', error);
        }
    };

    return (
        <div>
            <h2>Product List</h2>
            <button onClick={() => navigate('/admin/products/upsert')}>Add New Product</button>

            {products.length > 0 ? (
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
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.description || 'No description'}</td>
                                <td>${product.price}</td>
                                <td>{product.stock}</td>
                                <td>{product.category_name || 'Unassigned'}</td> {/* ✅ Displays category */}
                                <td>
                                    {product.image_path ? (
                                        <img
                                            src={`http://localhost:5000${product.image_path}`}
                                            alt={product.name}
                                            width="50"
                                            height="50"
                                            onError={(e) => {
                                                console.error(`❌ Image failed to load: ${e.target.src}`);
                                                e.target.src = '/images/other_images/dummy_product.jpg'; // ✅ Fallback image
                                            }}
                                        />
                                    ) : (
                                        <span>No Image</span> // ✅ Wrapped in <span> to prevent hydration issu
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
