import { useNavigate } from 'react-router-dom';
import DepartmentTable from '../../../components/tables/DepartmentTable';
import AdminLayout from '../../../components/admin/AdminLayout';

const DepartmentList = () => {
    const navigate = useNavigate();
    return (
        <AdminLayout
            title="Manage Departments"
            actions={(
                <button
                    className="admin-btn admin-btn--primary"
                    onClick={() => navigate('/admin/departments/upsert')}
                >
                    Add New Department
                </button>
            )}
        >
            <DepartmentTable />
        </AdminLayout>
    );
};

export default DepartmentList;
