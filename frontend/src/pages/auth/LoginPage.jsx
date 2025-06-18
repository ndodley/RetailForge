import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const user = await login(formData.email, formData.password);
        if (!user) {
            setError('Invalid email or password.');
            return;
        }
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
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Login</button>
        </form>
    );
};

export default LoginPage;
