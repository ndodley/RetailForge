import { useNavigate } from 'react-router-dom';
import DepartmentTable from '../../../components/tables/DepartmentTable';

const DepartmentList = () => {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
            padding: 0,
        }}>
            <div>
                <h2>Manage Departments</h2>
                <button onClick={() => navigate('/admin/departments/upsert')}>Add New Department</button>
                <DepartmentTable />
            </div>
        </div>
    );
};

export default DepartmentList;
