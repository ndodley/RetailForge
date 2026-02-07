import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../../components/admin/AdminLayout";

const UpsertUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "customer",
        phone_number: "",
        address: ""
    });

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/api/users/${id}`)
                .then((response) => setFormData(response.data))
                .catch((error) => console.error("❌ Error fetching user:", error));
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/users/${id}`, formData);
            } else {
                await axios.post("http://localhost:5000/api/users", formData);
            }
            navigate("/admin/users");
        } catch (error) {
            console.error("❌ Error saving user:", error);
        }
    };

    return (
        <AdminLayout
            title={id ? "Edit User" : "Add New User"}
            subtitle="Create or update a user account."
        >
            <form onSubmit={handleSubmit}>
                <div className="admin-field-grid">
                    <div className="admin-field">
                        <div className="admin-label">First Name</div>
                        <input className="admin-input" type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Last Name</div>
                        <input className="admin-input" type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Email</div>
                        <input className="admin-input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Password</div>
                        <input className="admin-input" type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Phone Number</div>
                        <input className="admin-input" type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                    </div>

                    <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                        <div className="admin-label">Address</div>
                        <textarea className="admin-textarea" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                </div>

                <div className="admin-actions" style={{ marginTop: 14 }}>
                    <button className="admin-btn admin-btn--primary" type="submit">{id ? "Update User" : "Add User"}</button>
                    <button className="admin-btn" type="button" onClick={() => navigate("/admin/users")}>Go Back</button>
                </div>
            </form>
        </AdminLayout>
    );
};

export default UpsertUser;
