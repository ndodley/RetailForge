import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--nav-bg)',
            padding: '1.5rem 1rem',
        }}>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
            }}>
                <div style={{ fontWeight: 900, fontSize: 'clamp(18px, 1.6vw, 22px)', color: 'var(--text)', letterSpacing: 0.3, lineHeight: 1 }}>
                    RetailForge
                </div>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link to="/products" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'none' }}>Products</Link>
                    <Link to="/my-favorites" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'none' }}>Favorites</Link>
                    <Link to="/my-orders" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'none' }}>Orders</Link>
                    <Link to="/my-profile" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'none' }}>Profile</Link>
                </div>

                <div style={{ color: 'var(--muted-2)', fontWeight: 700, fontSize: 13 }}>
                    © {new Date().getFullYear()} RetailForge. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
