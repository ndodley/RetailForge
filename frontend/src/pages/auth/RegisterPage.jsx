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
        <div style={{
            minHeight: '100%',
            background: 'var(--app-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem',
            boxSizing: 'border-box',
        }}>
            <form onSubmit={handleSubmit} style={{
                background: 'var(--surface-2)',
                padding: '2.5rem 2.5rem 2rem 2.5rem',
                borderRadius: 18,
                boxShadow: '0 6px 32px rgba(0,123,255,0.10)',
                border: '1px solid var(--border)',
                minWidth: 420,
                maxWidth: 560,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16
            }}>
                <div style={{ fontSize: 44, marginBottom: 8, color: '#28a745' }}>📝</div>
                <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: 'var(--text)', letterSpacing: 1 }}>Create Account</h2>
                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border)',
                        fontSize: 16,
                        outline: 'none',
                        transition: 'border 0.2s',
                        background: 'var(--surface-2)',
                        color: 'var(--text)'
                    }} />
                    <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border)',
                        fontSize: 16,
                        outline: 'none',
                        transition: 'border 0.2s',
                        background: 'var(--surface-2)',
                        color: 'var(--text)'
                    }} />
                </div>

                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border)',
                        fontSize: 16,
                        outline: 'none',
                        transition: 'border 0.2s',
                        background: 'var(--surface-2)',
                        color: 'var(--text)'
                    }} />
                    <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} required style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border)',
                        fontSize: 16,
                        outline: 'none',
                        transition: 'border 0.2s',
                        background: 'var(--surface-2)',
                        color: 'var(--text)'
                    }} />
                </div>

                <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid var(--border)',
                    fontSize: 16,
                    outline: 'none',
                    transition: 'border 0.2s',
                    background: 'var(--surface-2)',
                    color: 'var(--text)'
                }} />
                <textarea name="address" placeholder="Address" onChange={handleChange} required style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1.5px solid var(--border)',
                    fontSize: 16,
                    outline: 'none',
                    transition: 'border 0.2s',
                    resize: 'vertical',
                    minHeight: 60,
                    background: 'var(--surface-2)',
                    color: 'var(--text)'
                }} />
                <button type="submit" style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #28a745 60%, #007bff 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '14px 0',
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: '0 2px 8px rgba(40,167,69,0.08)',
                    cursor: 'pointer',
                    marginTop: 8,
                    marginBottom: 8,
                    transition: 'background 0.2s, box-shadow 0.2s',
                }}>Register</button>
                <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>
                    Already have an account? <a href="/login" style={{ color: 'var(--link)', textDecoration: 'underline', fontWeight: 600 }}>Login</a>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;
