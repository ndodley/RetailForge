-- 010_create_reviews_table.sql
-- Create a table to store product reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY, -- Unique review ID, auto-incremented
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- Links review to a product; deletes reviews if product is deleted
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Links review to a user; deletes reviews if user is deleted
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Rating value (1-5 only)
    comment TEXT, -- Optional review text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when review was created
);
