-- Shopping Cart Items Table (for multiple products per cart)
CREATE TABLE shopping_cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES shopping_cart(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    UNIQUE(cart_id, product_id) -- Ensures one product per cart (needed for ON CONFLICT)
);
