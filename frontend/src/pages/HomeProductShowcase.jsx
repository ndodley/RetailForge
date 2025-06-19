import React, { useEffect, useState } from 'react';
import ProductCard from '../components/common/ProductCard';

const HomeProductShowcase = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data.slice(0, 6)); // Show only a few products
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load products');
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ textAlign: 'center', color: '#888', margin: '2rem 0' }}>Loading products...</div>;
    if (error) return <div style={{ textAlign: 'center', color: 'red', margin: '2rem 0' }}>{error}</div>;
    if (!products.length) return <div style={{ textAlign: 'center', color: '#888', margin: '2rem 0' }}>No products to show.</div>;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            maxWidth: 1200,
            margin: '0 auto',
            marginTop: 32,
            marginBottom: 32,
        }}>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default HomeProductShowcase;
