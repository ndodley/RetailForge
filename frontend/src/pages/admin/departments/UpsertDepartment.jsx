import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/AdminLayout';
import BulkUploadSection from '../../../components/admin/BulkUploadSection';
import { departmentCsv } from '../../../utils/adminCsvSchemas';

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
        <AdminLayout
            title={id ? 'Edit Department' : 'Add New Department'}
            subtitle="Departments are used to group categories and products."
        >
            <form onSubmit={handleSubmit}>
                <div className="admin-field-grid">
                    <div className="admin-field">
                        <div className="admin-label">Department Name</div>
                        <input
                            className="admin-input"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Electronics"
                            required
                        />
                    </div>
                </div>

                <div className="admin-actions" style={{ marginTop: 14 }}>
                    <button className="admin-btn admin-btn--primary" type="submit">
                        {id ? 'Update Department' : 'Add Department'}
                    </button>
                    <button className="admin-btn" type="button" onClick={() => navigate('/admin/departments')}>
                        Go Back
                    </button>
                </div>
            </form>

            {!id ? (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                    <BulkUploadSection
                        title="Bulk Upload"
                        description="Upload a departments CSV to create multiple departments at once."
                        columns={departmentCsv.columns}
                        filename={departmentCsv.filename}
                        uploadUrl="http://localhost:5000/api/departments/bulk"
                    />
                </div>
            ) : null}
        </AdminLayout>
    );
};

export default UpsertDepartment;
