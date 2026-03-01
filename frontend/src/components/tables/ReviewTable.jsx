import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdvancedSearchPanel from '../common/AdvancedSearchPanel';
import { downloadCsv } from '../../utils/csv';
import { reviewCsv, mapToCsvRows } from '../../utils/adminCsvSchemas';
import { backendImageUrl } from '../../utils/images';

const ReviewTable = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('best');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const pageSize = 6;

  const renderStars = (ratingValue) => {
    const rating = Math.max(0, Math.min(5, Math.round(Number(ratingValue) || 0)));
    return (
      <span aria-label={`Rating: ${rating} out of 5`} title={`${rating} / 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{ color: i < rating ? 'var(--accent)' : 'var(--muted)', letterSpacing: 1 }}
          >
            {i < rating ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };

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

  useEffect(() => {
    setPage(1);
  }, [filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pagedReviews = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

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

      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '12px 0 10px' }}>
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

      {!loading && filtered.length > 0 ? (
        <div className="admin-pagination">
          <div className="admin-pagination-meta">
            Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </div>
          <div className="admin-pagination-controls">
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title={safePage <= 1 ? 'Already on first page' : 'Previous page'}
            >
              Prev
            </button>
            <div className="admin-pagination-meta">Page {safePage} / {totalPages}</div>
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title={safePage >= totalPages ? 'Already on last page' : 'Next page'}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No reviews found.</div>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <div className="admin-grid">
          {pagedReviews.map((r) => (
            <div key={r.id} className="admin-grid-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <img
                    src={backendImageUrl(r.product_image_path)}
                    alt=""
                    width={38}
                    height={38}
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = backendImageUrl('/images/other_images/dummy_product.jpg');
                    }}
                  />
                  <div className="admin-grid-title" style={{ overflowWrap: 'anywhere', minWidth: 0 }}>
                    {r.product_name}
                  </div>
                </div>

                <div className="admin-grid-meta" style={{ whiteSpace: 'nowrap' }}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <img
                    src={backendImageUrl(r.avatar_path)}
                    alt=""
                    width={26}
                    height={26}
                    style={{ objectFit: 'cover', borderRadius: 999 }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = backendImageUrl('');
                    }}
                  />
                  <div className="admin-grid-meta" style={{ overflowWrap: 'anywhere' }}>User: {r.username}</div>
                </div>
                <div className="admin-grid-meta">{renderStars(r.rating)}</div>
              </div>

              <div className="admin-grid-meta" style={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
                {r.comment}
              </div>

              <div className="admin-grid-actions admin-row-actions">
                <button
                  type="button"
                  onClick={() => handleEdit(r.id)}
                  className="admin-icon-btn"
                  title="Edit"
                >
                  <span className="admin-action-icon" aria-hidden="true">✎</span>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="admin-icon-btn admin-icon-btn--danger"
                  title="Delete"
                >
                  <span className="admin-action-icon" aria-hidden="true">✕</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ReviewTable;
