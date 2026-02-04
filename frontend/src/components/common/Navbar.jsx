import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate(); // <-- Add navigate
    const [adminOpen, setAdminOpen] = useState(false); // State for admin dropdown

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest('.admin-dropdown-parent')) {
                setAdminOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = async () => {
        await logout();
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
            <ul style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                listStyle: 'none',
                margin: 0,
                padding: 0,
                gap: 18
            }}>
                <li style={{ fontWeight: 900, fontSize: 26, letterSpacing: 1, color: '#ff9800', marginRight: 32 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#ff9800', borderBottom: location.pathname === '/' ? '2.5px solid #ff9800' : '2.5px solid transparent', paddingBottom: 2, transition: 'border 0.2s' }}>Department Store</Link>
                </li>
                {/* Admin Dropdown for Managers or Admins, only if logged in */}
                {user && (user.role === "manager" || user.role === "admin") && (
                    <li className="admin-dropdown-parent" style={{ position: 'relative', marginRight: 18 }}>
                        <span
                            style={{ fontWeight: 600, cursor: 'pointer', color: '#fff', padding: '8px 16px', borderRadius: 8, transition: 'background 0.2s' }}
                            onClick={() => setAdminOpen((open) => !open)}
                        >
                            Admin <span style={{ fontSize: 16 }}>▼</span>
                        </span>
                        <ul
                            className="navbar-admin-dropdown"
                            style={{
                                position: 'absolute',
                                top: 38,
                                left: 0,
                                background: '#232526',
                                border: '1.5px solid #ff9800',
                                borderRadius: 10,
                                boxShadow: '0 4px 16px rgba(255,140,0,0.10)',
                                padding: 0,
                                margin: 0,
                                minWidth: 170,
                                zIndex: 100,
                                display: adminOpen ? 'block' : 'none',
                            }}
                        >
                            <li><Link to="/admin/departments" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '12px 18px', color: '#ff9800', textDecoration: 'none', fontWeight: 600 }}>Departments</Link></li>
                            <li><Link to="/admin/categories" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '12px 18px', color: '#ff9800', textDecoration: 'none', fontWeight: 600 }}>Categories</Link></li>
                            <li><Link to="/admin/products" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '12px 18px', color: '#ff9800', textDecoration: 'none', fontWeight: 600 }}>Products</Link></li>
                            <li><Link to="/admin/users" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '12px 18px', color: '#ff9800', textDecoration: 'none', fontWeight: 600 }}>Users</Link></li>
                            <li><Link to="/admin/reviews" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '12px 18px', color: '#ff9800', textDecoration: 'none', fontWeight: 600 }}>Reviews</Link></li>
                            <li><Link to="/admin/orders" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '12px 18px', color: '#ff9800', textDecoration: 'none', fontWeight: 600 }}>Orders</Link></li>
                        </ul>
                    </li>
                )}
                <li style={{ marginRight: 18 }}>
                    <Link to="/products" style={{ fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, borderBottom: location.pathname.startsWith('/products') ? '2.5px solid #ff9800' : '2.5px solid transparent', transition: 'border 0.2s' }}>Products</Link>
                </li>
                {user && (
                    <li style={{ marginRight: 18 }}>
                        <Link to="/my-orders" style={{ fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, borderBottom: location.pathname === '/my-orders' ? '2.5px solid #ff9800' : '2.5px solid transparent', transition: 'border 0.2s' }}>My Orders</Link>
                    </li>
                )}
                {user && (
                    <li style={{ marginRight: 18 }}>
                        <Link to="/my-favorites" style={{ fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, borderBottom: location.pathname === '/my-favorites' ? '2.5px solid #ff9800' : '2.5px solid transparent', transition: 'border 0.2s' }}>My Favorites</Link>
                    </li>
                )}
                {user && (
                    <li style={{ marginRight: 18 }}>
                        <Link to="/my-reviews" style={{ fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, borderBottom: location.pathname === '/my-reviews' ? '2.5px solid #ff9800' : '2.5px solid transparent', transition: 'border 0.2s' }}>My Reviews</Link>
                    </li>
                )}
                {/* Shopping Cart without product count */}
                <li style={{ marginRight: 18 }}>
                    <Link to="/cart" title="Shopping Cart" style={{ fontSize: 22, display: 'flex', alignItems: 'center', color: '#ff9800', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, borderBottom: location.pathname === '/cart' ? '2.5px solid #ff9800' : '2.5px solid transparent', transition: 'border 0.2s' }}>
                        <span role="img" aria-label="cart" style={{ marginRight: 4 }}>🛒</span>
                    </Link>
                </li>
                <li style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,152,0,0.12)', borderRadius: 999, padding: '6px 18px', boxShadow: '0 1px 4px rgba(255,140,0,0.04)' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 16, marginRight: 8 }}>Welcome, {user.first_name}!</span>
                            <button onClick={handleLogout} style={{
                                background: 'linear-gradient(90deg, #ff9800 60%, #ff5722 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 22px',
                                fontWeight: 700,
                                fontSize: 16,
                                boxShadow: '0 2px 8px rgba(255,140,0,0.08)',
                                cursor: 'pointer',
                                transition: 'background 0.2s, box-shadow 0.2s',
                            }}>Logout</button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: '#ff9800', textDecoration: 'none', fontWeight: 700, fontSize: 16, padding: '8px 18px', borderRadius: 8, borderBottom: location.pathname === '/login' ? '2.5px solid #ff9800' : '2.5px solid transparent', transition: 'border 0.2s' }}>Login</Link>
                            <Link to="/register" style={{ color: '#ff9800', textDecoration: 'none', fontWeight: 700, fontSize: 16, padding: '8px 18px', borderRadius: 8, borderBottom: location.pathname === '/register' ? '2.5px solid #ff9800' : '2.5px solid transparent', transition: 'border 0.2s' }}>Register</Link>
                        </>
                    )}
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
