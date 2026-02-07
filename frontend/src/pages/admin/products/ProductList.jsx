import { useNavigate } from 'react-router-dom';
import ProductTable from '../../../components/tables/ProductTable';
import AdminLayout from '../../../components/admin/AdminLayout';

const ProductList = () => {
    const navigate = useNavigate();
    return (
        <AdminLayout
            title="Manage Products"
            actions={(
                <button
                    className="admin-btn admin-btn--primary"
                    onClick={() => navigate('/admin/products/upsert')}
                >
                    Add New Product
                </button>
            )}
        >
            <ProductTable />
        </AdminLayout>
    );
};

export default ProductList;
