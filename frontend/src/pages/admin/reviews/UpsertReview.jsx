import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/admin/AdminLayout';
import BulkUploadSection from '../../../components/admin/BulkUploadSection';
import { reviewCsv } from '../../../utils/adminCsvSchemas';

const UpsertReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product_id: '',
    user_id: '',
    rating: '',
    comment: ''
  });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
    if (id) {
      axios.get(`http://localhost:5000/api/reviews/${id}`)
        .then(res => setFormData(res.data))
        .catch(() => {});
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/reviews/${id}`, formData, { withCredentials: true });
      } else {
        await axios.post('http://localhost:5000/api/reviews', formData, { withCredentials: true });
      }
      navigate('/admin/reviews');
    } catch (error) {
      alert('Error saving review');
    }
  };

  return (
    <AdminLayout
      title={id ? 'Edit Review' : 'Add New Review'}
      subtitle="Reviews help customers evaluate products."
    >
      <form onSubmit={handleSubmit}>
        <div className="admin-field-grid">
          <div className="admin-field">
            <div className="admin-label">Product</div>
            <select className="admin-select" name="product_id" value={formData.product_id} onChange={handleChange} required>
              <option value="">Select a product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <div className="admin-label">User</div>
            <select className="admin-select" name="user_id" value={formData.user_id} onChange={handleChange} required>
              <option value="">Select a user</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <div className="admin-label">Rating (1-5)</div>
            <input className="admin-input" type="number" name="rating" min="1" max="5" value={formData.rating} onChange={handleChange} required />
          </div>

          <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-label">Comment</div>
            <textarea className="admin-textarea" name="comment" value={formData.comment} onChange={handleChange} required />
          </div>
        </div>

        <div className="admin-actions" style={{ marginTop: 14 }}>
          <button className="admin-btn admin-btn--primary" type="submit">{id ? 'Update Review' : 'Add Review'}</button>
          <button className="admin-btn" type="button" onClick={() => navigate('/admin/reviews')}>Go Back</button>
        </div>
      </form>

      {!id ? (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
          <BulkUploadSection
            title="Bulk Upload"
            description="Upload a reviews CSV. product_id and user_id must reference existing records."
            columns={reviewCsv.columns}
            filename={reviewCsv.filename}
            uploadUrl="http://localhost:5000/api/reviews/bulk"
          />
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default UpsertReview;
