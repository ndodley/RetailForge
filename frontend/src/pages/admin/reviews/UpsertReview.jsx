
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', padding: 0 }}>
      <div>
        <h2>{id ? 'Edit Review' : 'Add New Review'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Product:
              <select name="product_id" value={formData.product_id} onChange={handleChange} required>
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>User:
              <select name="user_id" value={formData.user_id} onChange={handleChange} required>
                <option value="">Select a user</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>Rating:
              <input type="number" name="rating" min="1" max="5" value={formData.rating} onChange={handleChange} required />
            </label>
          </div>
          <div>
            <label>Comment:
              <textarea name="comment" value={formData.comment} onChange={handleChange} required />
            </label>
          </div>
          <button type="submit">{id ? 'Update Review' : 'Add Review'}</button>
          <button type="button" onClick={() => navigate('/admin/reviews')}>Go Back</button>
        </form>
      </div>
    </div>
  );
};

export default UpsertReview;
