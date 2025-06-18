import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom'; // ✅ Import navigation and location hooks

const RegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await register(formData);
        // Redirect to previous page or home
        const from = location.state?.from;
        if (from && typeof from === 'object' && from.pathname) {
            navigate(from.pathname + (from.search || ''), { replace: true });
        } else if (typeof from === 'string') {
            navigate(from, { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
            <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
            <textarea name="address" placeholder="Address" onChange={handleChange} required />

            <button type="submit">Register</button>
        </form>
    );
};

export default RegisterPage;
