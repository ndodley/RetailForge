-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster user order lookups
CREATE INDEX idx_orders_user_id ON orders(user_id);
