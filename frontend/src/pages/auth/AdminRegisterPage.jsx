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

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: 320 }}>
                <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
                <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
                <textarea name="address" placeholder="Address" onChange={handleChange} required />

                <div>
                    <label>
                        <input type="radio" name="role" value="customer" checked={formData.role === 'customer'} onChange={handleRoleChange} />
                        Customer
                    </label>
                    <label>
                        <input type="radio" name="role" value="employee" checked={formData.role === 'employee'} onChange={handleRoleChange} />
                        Employee
                    </label>
                </div>

                <button type="submit">Register User</button>
            </form>
        </div>
    );
};

export default AdminRegisterPage;
