
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const tableStyle = {
  width: 1100,
  minWidth: 900,
  maxWidth: '100%',
  marginTop: 20,
  borderCollapse: 'collapse',
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  overflow: 'hidden',
  tableLayout: 'fixed',
};
const thStyle = {
  background: '#f3f4f6',
  color: '#333',
  fontWeight: 700,
  padding: '12px 10px',
  borderBottom: '2px solid #e5e7eb',
};
const tdStyle = {
  padding: '10px 8px',
  borderBottom: '1px solid #e5e7eb',
  color: '#222',
  wordBreak: 'break-word',
  whiteSpace: 'pre-line',
  overflowWrap: 'break-word',
};
const commentTdStyle = {
  ...tdStyle,
  maxWidth: 220,
  minWidth: 120,
  whiteSpace: 'pre-line',
};
const filterBarStyle = {
  display: 'flex',
  gap: 16,
  margin: '18px 0 8px 0',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const ReviewTable = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/reviews')
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  // Get unique product names for filter dropdown
  const productOptions = Array.from(new Set(reviews.map(r => r.product_name)));

  // Filtering logic
  const filtered = reviews.filter(r => {
    let pass = true;
    if (productFilter !== 'all' && r.product_name !== productFilter) pass = false;
    if (ratingFilter !== 'all' && String(r.rating) !== String(ratingFilter)) pass = false;
    return pass;
  });

  const handleEdit = (id) => {
    navigate(`/admin/reviews/upsert/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    await axios.delete(`http://localhost:5000/api/reviews/${id}`);
    setReviews(reviews.filter(r => r.id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={filterBarStyle}>
        <label>
          Product:
          <select value={productFilter} onChange={e => setProductFilter(e.target.value)}>
            <option value="all">All</option>
            {productOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          Rating:
          <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
            <option value="all">All</option>
            {[5,4,3,2,1].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <table style={tableStyle}>
          <colgroup>
            <col style={{ width: 50 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 70 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 120 }} />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Rating</th>
              <th style={thStyle}>Comment</th>
              <th style={thStyle}>Date Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={tdStyle}>No reviews found.</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id}>
                  <td style={tdStyle}>{r.id}</td>
                  <td style={tdStyle}>{r.product_name}</td>
                  <td style={tdStyle}>{r.username}</td>
                  <td style={tdStyle}>{r.rating}</td>
                  <td style={commentTdStyle}>{r.comment}</td>
                  <td style={tdStyle}>{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleEdit(r.id)}
                      title="Edit"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 20,
                        marginRight: 8,
                        color: '#1976d2',
                        padding: 4,
                        borderRadius: 4,
                        transition: 'background 0.2s',
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      title="Delete"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 20,
                        color: '#ff5252',
                        padding: 4,
                        borderRadius: 4,
                        transition: 'background 0.2s',
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewTable;
