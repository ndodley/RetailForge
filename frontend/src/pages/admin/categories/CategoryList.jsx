import { useNavigate } from 'react-router-dom';
import CategoryTable from '../../../components/tables/CategoryTable';

const CategoryList = () => {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
            padding: 0,
        }}>
            <div>
                <h2>Manage Categories</h2>
                <button onClick={() => navigate('/admin/categories/upsert')}>Add New Category</button>
                <CategoryTable />
            </div>
        </div>
    );
};

export default CategoryList;
