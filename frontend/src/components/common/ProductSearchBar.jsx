import React from 'react';

const ProductSearchBar = ({
    search,
    setSearch
}) => {
    return (
        <div className="product-filters" style={{
            display: 'flex',
            flexDirection: 'row', // Force single row
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0, // No gap for seamless look
            marginBottom: '2rem',
            flexWrap: 'nowrap', // Prevent wrapping to new row
            width: '100%',
            maxWidth: 700,
            marginLeft: 'auto',
            marginRight: 'auto',
        }}>
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    flex: '0 1 220px',
                    minWidth: 180,
                    maxWidth: 240,
                    height: 44,
                    padding: '0 1rem',
                    borderRadius: '8px 0 0 8px',
                    border: '1.5px solid #b3c6e0',
                    borderRight: 'none',
                    fontSize: 16,
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    outline: 'none',
                    transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.border = '2px solid #007bff'}
                onBlur={e => e.target.style.border = '1.5px solid #b3c6e0'}
            />
            {/* Dropdowns will be rendered to the right in ProductPage.jsx and should use borderRadius: '0 8px 8px 0' for the first dropdown, and '0' for the last if needed, to match */}
        </div>
    );
};

export default ProductSearchBar;
