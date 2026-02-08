import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/AdminLayout';
import BulkUploadSection from '../../../components/admin/BulkUploadSection';
import { categoryCsv } from '../../../utils/adminCsvSchemas';

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
        <AdminLayout
            title={id ? 'Edit Category' : 'Add New Category'}
            subtitle="Categories belong to a department."
        >
            <form onSubmit={handleSubmit}>
                <div className="admin-field-grid">
                    <div className="admin-field">
                        <div className="admin-label">Name</div>
                        <input
                            className="admin-input"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Department</div>
                        <select
                            className="admin-select"
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a Department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                        <div className="admin-label">Description</div>
                        <textarea
                            className="admin-textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="admin-actions" style={{ marginTop: 14 }}>
                    <button className="admin-btn admin-btn--primary" type="submit">
                        {id ? 'Update Category' : 'Add Category'}
                    </button>
                    <button className="admin-btn" type="button" onClick={() => navigate('/admin/categories')}>
                        Go Back
                    </button>
                </div>
            </form>

            {!id ? (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                    <BulkUploadSection
                        title="Bulk Upload"
                        description="Upload a categories CSV. department_id is required for each row."
                        columns={categoryCsv.columns}
                        filename={categoryCsv.filename}
                        uploadUrl="http://localhost:5000/api/categories/bulk"
                    />
                </div>
            ) : null}
        </AdminLayout>
    );
};

export default UpsertCategory;
