import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpsertDepartment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/api/departments/${id}`)
                .then((response) => setFormData(response.data))
                .catch((error) => console.error('❌ Error fetching department:', error));
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/departments/${id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/departments', formData);
            }
            navigate('/admin/departments'); // ✅ Navigates to department list page
        } catch (error) {
            console.error('❌ Error saving department:', error);
        }
    };

    return (
        <div>
            <h2>{id ? 'Edit Department' : 'Add New Department'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </label>
                    <button type="submit">{id ? 'Update Department' : 'Add Department'}</button>
                </div>
                <div>
                    <button type="button" onClick={() => navigate('/admin/departments')}>Go Back</button> {/* ✅ Added Go Back */}
                </div>
            </form>
        </div>
    );
};

export default UpsertDepartment;
