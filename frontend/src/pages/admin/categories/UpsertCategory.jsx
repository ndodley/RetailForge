import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpsertCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        department_id: '',
    });
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/api/categories/${id}`)
                .then((response) => setFormData(response.data))
                .catch((error) => console.error('❌ Error fetching category:', error));
        }
    }, [id]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/departments')
            .then((response) => setDepartments(response.data))
            .catch((error) => console.error('❌ Error fetching departments:', error));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/categories/${id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/categories', formData);
            }
            navigate('/admin/categories'); // ✅ Navigates to category list page
        } catch (error) {
            console.error('❌ Error saving category:', error);
        }
    };

    return (
        <div>
            <h2>{id ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <div>
                        <label>Name:
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </label>
                    </div>
                    <div>
                        <label>Description:
                            <textarea name="description" value={formData.description} onChange={handleChange} required />
                        </label>
                    </div>
                    <div>
                        <label>Department:
                            <select name="department_id" value={formData.department_id} onChange={handleChange} required>
                                <option value="">Select a Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <button type="submit">{id ? 'Update Category' : 'Add Category'}</button>
                <button type="button" onClick={() => navigate('/admin/categories')}>Go Back</button> {/* ✅ Added Go Back */}
            </form>
        </div>
    );
};

export default UpsertCategory;
