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
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <form onSubmit={handleSubmit} style={{
                background: '#fff',
                padding: '2.5rem 2.5rem 2rem 2.5rem',
                borderRadius: 18,
                boxShadow: '0 6px 32px rgba(0,123,255,0.10)',
                minWidth: 340,
                maxWidth: 380,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18
            }}>
                <div style={{ fontSize: 44, marginBottom: 8, color: '#007bff' }}>🔒</div>
                <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: '#222', letterSpacing: 1 }}>Sign In</h2>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #b3c6e0',
                    fontSize: 16,
                    marginBottom: 8,
                    outline: 'none',
                    transition: 'border 0.2s',
                }} />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #b3c6e0',
                    fontSize: 16,
                    marginBottom: 8,
                    outline: 'none',
                    transition: 'border 0.2s',
                }} />
                <button type="submit" style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '14px 0',
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
                    cursor: 'pointer',
                    marginTop: 8,
                    marginBottom: 8,
                    transition: 'background 0.2s, box-shadow 0.2s',
                }}>Login</button>
                <div style={{ fontSize: 15, color: '#555', marginTop: 8 }}>
                    Don't have an account? <a href="/register" style={{ color: '#007bff', textDecoration: 'underline', fontWeight: 600 }}>Register</a>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
