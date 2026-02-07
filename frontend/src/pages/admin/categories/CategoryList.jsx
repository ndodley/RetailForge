import { useNavigate } from 'react-router-dom';
import CategoryTable from '../../../components/tables/CategoryTable';
import AdminLayout from '../../../components/admin/AdminLayout';

const CategoryList = () => {
    const navigate = useNavigate();
    return (
        <AdminLayout
            title="Manage Categories"
            actions={(
                <button
                    className="admin-btn admin-btn--primary"
                    onClick={() => navigate('/admin/categories/upsert')}
                >
                    Add New Category
                </button>
            )}
        >
            <CategoryTable />
        </AdminLayout>
    );
};

export default CategoryList;
