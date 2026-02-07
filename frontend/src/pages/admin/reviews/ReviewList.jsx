import { useNavigate } from 'react-router-dom';
import ReviewTable from '../../../components/tables/ReviewTable';
import AdminLayout from '../../../components/admin/AdminLayout';

const ReviewList = () => {
  const navigate = useNavigate();
  return (
    <AdminLayout
      title="Manage Reviews"
      actions={(
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => navigate('/admin/reviews/upsert')}
        >
          Add Review
        </button>
      )}
    >
      <ReviewTable />
    </AdminLayout>
  );
};

export default ReviewList;
