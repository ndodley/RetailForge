import { useNavigate } from 'react-router-dom';
import ProductTable from '../../../components/tables/ProductTable';

const ProductList = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h2>Manage Products</h2>
            <button onClick={() => navigate('/admin/products/upsert')}>Add New Product</button>
            <ProductTable />
        </div>
    );
};

export default ProductList;
