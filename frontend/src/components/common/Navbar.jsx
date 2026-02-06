import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate(); // <-- Add navigate
    const [adminOpen, setAdminOpen] = useState(false); // State for admin dropdown
    const [accountOpen, setAccountOpen] = useState(false); // State for account dropdown

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest('.admin-dropdown-parent')) {
                setAdminOpen(false);
            }
            if (!e.target.closest('.account-dropdown-parent')) {
                setAccountOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = async () => {
        await logout();
        setAccountOpen(false);
        // If admin and on an admin page, redirect to home
        if (user && (user.role === 'admin' || user.role === 'manager') && location.pathname.startsWith('/admin/')) {
            navigate('/');
        }
    };

    return (
        <nav style={{
            background: 'linear-gradient(90deg, #181818 60%, #232526 100%)',
            borderRadius: 18,
            margin: '18px auto 32px auto',
            maxWidth: 1200,
            padding: '0.5rem 2.5rem',
            position: 'relative',
            zIndex: 10,
            border: 'none',
            boxShadow: '0 2px 8px rgba(255,140,0,0.10)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%' }}>
                {/* Left: Brand + main links (Admin, Products) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: 1, color: '#ff9800', marginRight: 32 }}>
                        <Link
                            to="/"
                            style={{
                                textDecoration: 'none',
                                color: '#ff9800',
                                borderBottom: location.pathname === '/' ? '2.5px solid #ff9800' : '2.5px solid transparent',
                                paddingBottom: 2,
                                transition: 'border 0.2s'
                            }}
                        >
                            Department Store
                        </Link>
                    </div>

                    {/* Admin Dropdown for Managers or Admins, only if logged in */}
                    {user && (user.role === "manager" || user.role === "admin") && (
                        <div className="admin-dropdown-parent" style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="navbar-pill"
                                style={{
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    color: '#fff',
                                    padding: '8px 16px',
                                    borderRadius: 999,
                                    transition: 'background 0.2s, border 0.2s',
                                    border: '1.5px solid rgba(255,152,0,0.35)',
                                    background: adminOpen ? 'rgba(255,152,0,0.14)' : 'rgba(255,255,255,0.06)'
                                }}
                                onClick={() => setAdminOpen((open) => !open)}
                            >
                                Admin <span style={{ fontSize: 14 }}>▼</span>
                            </button>
                            <ul
                                className="navbar-admin-dropdown"
                                style={{
                                    position: 'absolute',
                                    top: 44,
                                    left: 0,
                                    background: '#111827',
                                    border: '1.5px solid rgba(255,152,0,0.45)',
                                    borderRadius: 14,
                                    boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
                                    padding: 8,
                                    margin: 0,
                                    minWidth: 190,
                                    zIndex: 100,
                                    display: adminOpen ? 'block' : 'none',
                                    listStyle: 'none'
                                }}
                            >
                                <li><Link to="/admin/departments" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 800, borderRadius: 10 }}>Departments</Link></li>
                                <li><Link to="/admin/categories" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 800, borderRadius: 10 }}>Categories</Link></li>
                                <li><Link to="/admin/products" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 800, borderRadius: 10 }}>Products</Link></li>
                                <li><Link to="/admin/users" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 800, borderRadius: 10 }}>Users</Link></li>
                                <li><Link to="/admin/reviews" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 800, borderRadius: 10 }}>Reviews</Link></li>
                                <li><Link to="/admin/orders" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 800, borderRadius: 10 }}>Orders</Link></li>
                            </ul>
                        </div>
                    )}

                    <Link to="/products" className={`navbar-pill ${location.pathname.startsWith('/products') ? 'navbar-pill--active' : ''}`} style={{
                        fontWeight: 800,
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: '1.5px solid transparent',
                        background: location.pathname.startsWith('/products') ? 'rgba(255,152,0,0.14)' : 'rgba(255,255,255,0.06)',
                        transition: 'background 0.2s, border 0.2s'
                    }}>Products</Link>
                </div>

                {/* Right: Cart + Account */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    <Link to="/cart" title="Shopping Cart" className={`navbar-pill ${location.pathname === '/cart' ? 'navbar-pill--active' : ''}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#ff9800',
                        textDecoration: 'none',
                        padding: '8px 14px',
                        borderRadius: 999,
                        border: location.pathname === '/cart' ? '1.5px solid rgba(255,152,0,0.55)' : '1.5px solid rgba(255,152,0,0.30)',
                        background: location.pathname === '/cart' ? 'rgba(255,152,0,0.10)' : 'rgba(255,255,255,0.04)',
                        transition: 'background 0.2s, border 0.2s'
                    }}>
                        <span role="img" aria-label="cart" style={{ fontSize: 20 }}>🛒</span>
                        <span style={{ fontWeight: 900, color: '#fff' }}>Cart</span>
                    </Link>

                    {user ? (
                        <>
                            <div className="account-dropdown-parent" style={{ position: 'relative' }}>
                                <button
                                    type="button"
                                    className="navbar-pill"
                                    onClick={() => setAccountOpen((open) => !open)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '8px 14px',
                                        borderRadius: 999,
                                        border: '1.5px solid rgba(255,152,0,0.35)',
                                        background: accountOpen ? 'rgba(255,152,0,0.14)' : 'rgba(255,255,255,0.06)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s, border 0.2s'
                                    }}
                                >
                                    <img
                                        src={`http://localhost:5000${user.avatar_path || '/images/other_images/dummy_product.jpg'}`}
                                        alt="Avatar"
                                        style={{ width: 26, height: 26, borderRadius: 999, objectFit: 'cover', border: '1px solid rgba(255,152,0,0.45)' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
                                        }}
                                    />
                                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.email || user.first_name}
                                    </span>
                                    <span style={{ color: '#ff9800', fontWeight: 900, fontSize: 12 }}>▼</span>
                                </button>

                                <ul style={{
                                    position: 'absolute',
                                    top: 46,
                                    right: 0,
                                    background: '#111827',
                                    border: '1.5px solid rgba(255,152,0,0.45)',
                                    borderRadius: 14,
                                    boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
                                    padding: 8,
                                    margin: 0,
                                    minWidth: 220,
                                    zIndex: 120,
                                    display: accountOpen ? 'block' : 'none',
                                    listStyle: 'none'
                                }}>
                                    <li>
                                        <Link to="/my-profile" className={`navbar-menu-item ${location.pathname === '/my-profile' ? 'navbar-menu-item--active' : ''}`} onClick={() => setAccountOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 900, borderRadius: 10 }}>
                                            <span aria-hidden>👤</span> Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-orders" className={`navbar-menu-item ${location.pathname === '/my-orders' ? 'navbar-menu-item--active' : ''}`} onClick={() => setAccountOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 900, borderRadius: 10 }}>
                                            <span aria-hidden>📦</span> My Orders
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-reviews" className={`navbar-menu-item ${location.pathname === '/my-reviews' ? 'navbar-menu-item--active' : ''}`} onClick={() => setAccountOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 900, borderRadius: 10 }}>
                                            <span aria-hidden>⭐</span> My Reviews
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-favorites" className={`navbar-menu-item ${location.pathname === '/my-favorites' ? 'navbar-menu-item--active' : ''}`} onClick={() => setAccountOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#fff', textDecoration: 'none', fontWeight: 900, borderRadius: 10 }}>
                                            <span aria-hidden>❤️</span> My Favorites
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="navbar-menu-item"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '10px 12px',
                                                color: '#fff',
                                                textDecoration: 'none',
                                                fontWeight: 900,
                                                borderRadius: 10,
                                                background: 'transparent',
                                                border: 'none',
                                                width: '100%',
                                                cursor: 'pointer',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <span aria-hidden>🚪</span> Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{
                                color: '#ff9800',
                                textDecoration: 'none',
                                fontWeight: 900,
                                fontSize: 14,
                                padding: '8px 14px',
                                borderRadius: 999,
                                border: location.pathname === '/login' ? '1.5px solid rgba(255,152,0,0.55)' : '1.5px solid rgba(255,152,0,0.30)',
                                background: location.pathname === '/login' ? 'rgba(255,152,0,0.10)' : 'rgba(255,255,255,0.04)',
                                transition: 'background 0.2s, border 0.2s'
                            }}>Login</Link>
                            <Link to="/register" style={{
                                color: '#fff',
                                textDecoration: 'none',
                                fontWeight: 900,
                                fontSize: 14,
                                padding: '8px 14px',
                                borderRadius: 999,
                                border: '1.5px solid rgba(255,152,0,0.45)',
                                background: 'rgba(255,152,0,0.14)',
                                transition: 'background 0.2s, border 0.2s'
                            }}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
