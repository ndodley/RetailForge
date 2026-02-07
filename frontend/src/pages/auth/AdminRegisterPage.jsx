import { useState } from 'react';

const AdminRegisterPage = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'customer',
        phone_number: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        setFormData({ ...formData, role: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        console.log(data);
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1.5px solid var(--border)',
        background: 'var(--surface-2)',
        color: 'var(--text)',
        fontSize: 15,
        outline: 'none',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--app-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <form onSubmit={handleSubmit} style={{ background: 'var(--surface-2)', padding: '2rem', borderRadius: 16, boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)', minWidth: 320, width: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ margin: 0, marginBottom: 4, fontWeight: 900, color: 'var(--text)' }}>Register User</h2>
                <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>Create a customer or employee account.</div>

                <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required style={inputStyle} />
                <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required style={inputStyle} />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
                <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} required style={inputStyle} />
                <textarea name="address" placeholder="Address" onChange={handleChange} required style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />

                <div style={{ display: 'flex', gap: 14, alignItems: 'center', color: 'var(--text)', fontWeight: 800 }}>
                    <label>
                        <input type="radio" name="role" value="customer" checked={formData.role === 'customer'} onChange={handleRoleChange} />
                        Customer
                    </label>
                    <label>
                        <input type="radio" name="role" value="employee" checked={formData.role === 'employee'} onChange={handleRoleChange} />
                        Employee
                    </label>
                </div>

                <button type="submit" style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #ff9800 60%, #ff5722 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 0',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(255, 152, 0, 0.18)'
                }}>Register</button>
            </form>
        </div>
    );
};

export default AdminRegisterPage;
