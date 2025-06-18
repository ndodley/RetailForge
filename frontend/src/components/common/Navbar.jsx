import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

function Navbar() {
    const { user, logout } = useAuth(); 

    return (
        <nav>
            <ul className="navbar">
                <li className="project-title"><Link to="/">Department Store</Link></li>

                {/* ✅ Admin Dropdown for Managers */}
                {user?.role === "manager" && (
                    <li className="dropdown">
                        <span>Admin ▼</span>
                        <ul className="dropdown-menu">
                            <li><Link to="/admin/departments">Departments</Link></li>
                            <li><Link to="/admin/categories">Categories</Link></li>
                            <li><Link to="/admin/products">Products</Link></li>
                            <li><Link to="/admin/users">Users</Link></li> {/* ✅ Added Users tab */}
                        </ul>
                    </li>
                )}
                
                <li><Link to="/products">Products</Link></li>

                {/* ✅ Fully Right-Aligned User Info */}
                <li className="right-section">
                    {user ? (
                        <>
                            <span className="welcome-text">Welcome, {user.first_name}!</span>
                            <button className="logout-btn" onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
