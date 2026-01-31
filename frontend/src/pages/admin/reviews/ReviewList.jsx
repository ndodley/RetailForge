
import { useNavigate } from 'react-router-dom';
import ReviewTable from '../../../components/tables/ReviewTable';

const cardStyle = {
  maxWidth: 1200,
  margin: '48px auto',
  background: '#fff',
  borderRadius: 18,
  boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
  padding: '36px 32px 32px 32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const headingStyle = {
  fontSize: 32,
  fontWeight: 800,
  color: '#232526',
  marginBottom: 18,
  letterSpacing: 1,
};
const addBtnStyle = {
  background: 'linear-gradient(90deg, #ff9800 0%, #ffb347 100%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: 18,
  border: 'none',
  borderRadius: 8,
  padding: '10px 28px',
  marginBottom: 24,
  marginTop: 4,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(255,152,0,0.10)',
  transition: 'background 0.2s',
};

const ReviewList = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', padding: 0 }}>
      <div style={cardStyle}>
        <div style={headingStyle}>Admin Review Management</div>
        <button style={addBtnStyle} onClick={() => navigate('/admin/reviews/upsert')}>
          + Add Review
        </button>
        <ReviewTable />
      </div>
    </div>
  );
};

export default ReviewList;
