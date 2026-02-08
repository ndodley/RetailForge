import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdvancedSearchPanel from '../common/AdvancedSearchPanel';
import { downloadCsv } from '../../utils/csv';
import { reviewCsv, mapToCsvRows } from '../../utils/adminCsvSchemas';

const ReviewTable = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('best');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/reviews')
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const productOptions = useMemo(() => {
    const names = reviews.map((r) => r.product_name).filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => String(a).localeCompare(String(b)));
  }, [reviews]);

  const filterSections = useMemo(() => {
    return [
      {
        key: 'sort',
        title: 'Sort',
        type: 'radio',
        value: sortBy,
        onChange: (v) => setSortBy(String(v)),
        options: [
          { value: 'best', label: 'Best Match' },
          { value: 'date', label: 'Date' },
          { value: 'rating', label: 'Rating' },
          { value: 'product', label: 'Product' },
          { value: 'user', label: 'User' },
        ],
      },
      {
        key: 'order',
        title: 'Order',
        type: 'radio',
        value: sortOrder,
        onChange: (v) => setSortOrder(String(v)),
        options: [
          { value: 'asc', label: 'Ascending' },
          { value: 'desc', label: 'Descending' },
        ],
      },
      {
        key: 'product',
        title: 'Product',
        type: 'radio',
        value: productFilter,
        onChange: (v) => setProductFilter(String(v)),
        options: [
          { value: 'all', label: 'All' },
          ...productOptions.map((name) => ({ value: name, label: name })),
        ],
      },
      {
        key: 'rating',
        title: 'Rating',
        type: 'radio',
        value: ratingFilter,
        onChange: (v) => setRatingFilter(String(v)),
        options: [
          { value: 'all', label: 'All' },
          ...[5, 4, 3, 2, 1].map((rating) => ({ value: String(rating), label: String(rating) })),
        ],
      },
    ];
  }, [productFilter, productOptions, ratingFilter, sortBy, sortOrder]);

  // Filtering logic
  const filtered = useMemo(() => {
    let next = Array.isArray(reviews) ? reviews : [];

    next = next.filter((r) => {
      if (productFilter !== 'all' && r.product_name !== productFilter) return false;
      if (ratingFilter !== 'all' && String(r.rating) !== String(ratingFilter)) return false;
      return true;
    });

    const q = String(search || '').trim().toLowerCase();
    if (q) {
      next = next.filter((r) => {
        const product = String(r.product_name || '').toLowerCase();
        const user = String(r.username || '').toLowerCase();
        const comment = String(r.comment || '').toLowerCase();
        return product.includes(q) || user.includes(q) || comment.includes(q);
      });
    }

    const multiplier = sortOrder === 'asc' ? 1 : -1;
    next = [...next].sort((a, b) => {
      if (sortBy === 'rating') return multiplier * (Number(a.rating || 0) - Number(b.rating || 0));
      if (sortBy === 'product') return multiplier * String(a.product_name || '').localeCompare(String(b.product_name || ''));
      if (sortBy === 'user') return multiplier * String(a.username || '').localeCompare(String(b.username || ''));
      if (sortBy === 'date') return multiplier * (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      return 0;
    });

    return next;
  }, [productFilter, ratingFilter, reviews, search, sortBy, sortOrder]);

  const handleEdit = (id) => {
    navigate(`/admin/reviews/upsert/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    await axios.delete(`http://localhost:5000/api/reviews/${id}`);
    setReviews((prev) => prev.filter(r => r.id !== id));
  };

  return (
    <div>
      <div style={{ maxWidth: 980 }}>
        <AdvancedSearchPanel
          title="Advanced Search"
          query={search}
          onQueryChange={setSearch}
          isOpen={filtersOpen}
          onToggleOpen={() => setFiltersOpen((v) => !v)}
          onSearch={() => setFiltersOpen(false)}
          sections={filterSections}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0' }}>
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          onClick={() => downloadCsv({
            rows: mapToCsvRows(reviewCsv, filtered),
            filename: reviewCsv.filename,
            columns: reviewCsv.columns,
          })}
          disabled={loading || filtered.length === 0}
          title={loading || filtered.length === 0 ? 'No data to export' : 'Download CSV'}
        >
          Download CSV
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '10px 0', color: 'var(--muted)', fontWeight: 700 }}>Loading...</div>
      ) : null}

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: 240 }}>Product</th>
              <th style={{ width: 220 }}>User</th>
              <th style={{ width: 120 }}>Rating</th>
              <th>Comment</th>
              <th style={{ width: 220 }}>Date Created</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ color: 'var(--muted)', fontWeight: 700 }}>
                  No reviews found.
                </td>
              </tr>
            ) : !loading ? (
              filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 900 }}>{r.product_name}</td>
                  <td style={{ fontWeight: 800 }}>{r.username}</td>
                  <td style={{ fontWeight: 900 }}>{r.rating}</td>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'pre-line' }}>{r.comment}</td>
                  <td style={{ color: 'var(--muted)' }}>{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        onClick={() => handleEdit(r.id)}
                        className="admin-icon-btn"
                        title="Edit"
                      >
                        <span className="admin-action-icon" aria-hidden="true">✎</span>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="Delete"
                      >
                        <span className="admin-action-icon" aria-hidden="true">✕</span>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ color: 'var(--muted)', fontWeight: 700 }}>
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewTable;
