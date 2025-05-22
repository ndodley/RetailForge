import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

function Navbar() {
    const { user, logout } = useAuth(); 

    return (
        <nav>
            <ul>
                <li className="project-title"><Link to="/">Department Store</Link></li>

                {/* ✅ Admin Dropdown for Managers */}
                {user?.role === "manager" && (
                    <li className="dropdown">
                        <span>Admin ▼</span>
                        <ul className="dropdown-menu">
                            <li><Link to="/admin/departments">Departments</Link></li>
                            <li><Link to="/admin/categories">Categories</Link></li>  {/* ✅ Ensure separate <li> */}
                            <li><Link to="/admin/products">Products</Link></li>   {/* ✅ Ensure separate <li> */}
                        </ul>
                    </li>
                )}

                {/* ✅ Welcome Message */}
                {user ? (
                    <>
                        <li><span>Welcome, {user.first_name}!</span></li>
                        <li><button onClick={logout}>Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
