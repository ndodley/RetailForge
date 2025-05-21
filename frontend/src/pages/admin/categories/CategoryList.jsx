import { useNavigate } from 'react-router-dom';
import CategoryTable from '../../../components/tables/CategoryTable';

const CategoryList = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h2>Manage Categories</h2>
            <button onClick={() => navigate('/admin/categories/upsert')}>Add New Category</button>
            <CategoryTable />
        </div>
    );
};

export default CategoryList;
