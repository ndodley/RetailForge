
const {
  getAllReviews,
  createReview,
  getReviewsByProduct,
  deleteReview,
  getReviewById,
  updateReview,
  getReviewsByUserId,
  updateMyReview
} = require('../models/Review');

const pool = require('../db');

const handleGetAllReviews = async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleGetReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await getReviewById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleCreateReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id; // assumes auth middleware sets req.user
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }
    const review = await createReview({ product_id, user_id, rating, comment });
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleGetReviewsByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const reviews = await getReviewsByProduct(product_id);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleUpdateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, user_id, rating, comment } = req.body;
    // Only admin or owner can update
    let allow = false;
    if (req.user && req.user.role === 'admin') allow = true;
    else if (req.user && req.user.id && String(req.user.id) === String(user_id)) allow = true;
    if (!allow) return res.status(403).json({ error: 'Not allowed' });
    const updated = await updateReview(id, { product_id, user_id, rating, comment });
    if (!updated) return res.status(404).json({ error: 'Review not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    // If admin, allow delete any; if user, only own review
    let user_id = null;
    if (req.user && req.user.role === 'admin') {
      user_id = null; // admin can delete any
    } else if (req.user) {
      user_id = req.user.id;
    }
    const deleted = await deleteReview(id, user_id);
    if (!deleted) return res.status(403).json({ error: 'Not allowed' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleGetMyReviews = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });
    const reviews = await getReviewsByUserId(user_id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleUpdateMyReview = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }

    const updated = await updateMyReview(id, user_id, { rating, comment });
    if (!updated) return res.status(403).json({ error: 'Not allowed' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleDeleteMyReview = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const deleted = await deleteReview(id, user_id);
    if (!deleted) return res.status(403).json({ error: 'Not allowed' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleBulkCreateReviews = async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  if (!rows.length) {
    return res.status(400).json({ error: 'No rows provided.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let inserted = 0;
    for (const row of rows) {
      const product_id = Number(String(row?.product_id ?? '').trim());
      const user_id = Number(String(row?.user_id ?? '').trim());
      const rating = Number(String(row?.rating ?? '').trim());
      const commentRaw = String(row?.comment ?? '');
      const comment = commentRaw.trim() === '' ? null : commentRaw;

      if (!Number.isFinite(product_id) || !Number.isFinite(user_id) || !Number.isFinite(rating)) {
        return res.status(400).json({ error: 'Each review row requires product_id, user_id, and rating.' });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be 1-5.' });
      }

      const result = await client.query(
        `INSERT INTO reviews (product_id, user_id, rating, comment)
         VALUES ($1,$2,$3,$4) RETURNING id`,
        [product_id, user_id, rating, comment]
      );

      if (!result.rows?.[0]?.id) {
        return res.status(500).json({ error: 'Failed to create review.' });
      }

      inserted += 1;
    }

    await client.query('COMMIT');
    return res.status(201).json({ inserted });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = {
  handleGetAllReviews,
  handleGetReviewById,
  handleCreateReview,
  handleGetReviewsByProduct,
  handleUpdateReview,
  handleDeleteReview,
  handleGetMyReviews,
  handleUpdateMyReview,
  handleDeleteMyReview,
  handleBulkCreateReviews
};
