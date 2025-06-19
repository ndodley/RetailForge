import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
            padding: 0,
        }}>
            <div>
                <h2>{id ? "Edit User" : "Add New User"}</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>First Name:
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                        </label>
                    </div>
                    <div>
                        <label>Last Name:
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                        </label>
                    </div>
                    <div>
                        <label>Email:
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </label>
                    </div>
                    <div>
                        <label>Password:
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </label>
                    </div>
                    <div>
                        <label>Phone Number:
                            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                        </label>
                    </div>
                    <div>
                        <label>Address:
                            <textarea name="address" value={formData.address} onChange={handleChange} />
                        </label>
                    </div>
                    <button type="submit">{id ? "Update User" : "Add User"}</button>
                    <button type="button" onClick={() => navigate("/admin/users")}>Go Back</button>
                </form>
            </div>
        </div>
    );
};

export default UpsertUser;
