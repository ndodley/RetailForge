import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <div
            className="product-card"
            style={{
                width: 240, // Fixed width
                height: 370, // Fixed height
                border: '1px solid #eee',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                padding: '1rem',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'box-shadow 0.2s',
                minHeight: 0,
                maxWidth: 240,
                boxSizing: 'border-box',
            }}
        >
            <img
                src={`http://localhost:5000${product.image_path || '/images/other_images/dummy_product.jpg'}`}
                alt={product.name}
                style={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 12,
                    display: 'block',
                    background: '#f8f8f8',
                }}
                onError={e => { e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
            />
            <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0', textAlign: 'center' }}>{product.name}</h3>
            <p style={{ color: '#888', margin: '0.25rem 0 0.5rem 0' }}>${product.price}</p>
            <Link
                to={`/products/${product.id}`}
                style={{
                    marginTop: 'auto',
                    padding: '0.5rem 1.2rem',
                    background: '#007bff',
                    color: '#fff',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'background 0.2s',
                    display: 'inline-block',
                }}
                onMouseOver={e => (e.target.style.background = '#0056b3')}
                onMouseOut={e => (e.target.style.background = '#007bff')}
            >
                View Details
            </Link>
        </div>
    );
};

export default ProductCard;
