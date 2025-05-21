import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Importing CSS for styling

function Navbar() {
    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/admin/departments">Departments</Link></li>
                <li><Link to="/admin/categories">Categories</Link></li>
                <li><Link to="/admin/products">Products</Link></li>
            </ul>
        </nav>
    );
}


export default Navbar;
