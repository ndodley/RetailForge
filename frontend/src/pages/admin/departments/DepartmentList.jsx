import { useNavigate } from 'react-router-dom';
import DepartmentTable from '../../../components/tables/DepartmentTable';

const DepartmentList = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h2>Manage Departments</h2>
            <button onClick={() => navigate('/admin/departments/upsert')}>Add New Department</button>
            <DepartmentTable />
        </div>
    );
};

export default DepartmentList;
