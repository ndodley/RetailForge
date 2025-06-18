import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const ProductInfoPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load product info');
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div>Loading product...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found.</div>;

    return (
        <div style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem 1rem' }}>
            <Link to="/products" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 500 }}>&larr; Back to Products</Link>
            <div
                style={{
                    marginTop: 24,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 32,
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    padding: 32,
                    alignItems: 'flex-start',
                }}
            >
                <img
                    src={`http://localhost:5000${product.image_path || '/images/other_images/dummy_product.jpg'}`}
                    alt={product.name}
                    style={{
                        width: 320,
                        height: 320,
                        objectFit: 'cover',
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        background: '#f8f8f8',
                        display: 'block',
                    }}
                    onError={e => { e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                />
                <div style={{ flex: 1, minWidth: 220 }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>{product.name}</h2>
                    <p style={{ fontSize: '1.3rem', color: '#007bff', fontWeight: 600, margin: '0 0 1rem 0' }}>${product.price}</p>
                    <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: 24 }}>{product.description}</p>
                    {/* Add more product details as needed */}
                    <button
                        style={{
                            padding: '0.7rem 2rem',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: '1rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                            transition: 'background 0.2s',
                        }}
                        onMouseOver={e => (e.target.style.background = '#0056b3')}
                        onMouseOut={e => (e.target.style.background = '#007bff')}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductInfoPage;
