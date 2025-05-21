-- This SQL script creates the 'products' table in the database.
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description VARCHAR(400) NOT NULL,                                  -- Product description (required)
    stock INT DEFAULT 0 CHECK (stock >= 0),                             -- Product stock (default 0, must be >= 0)
    image_path TEXT DEFAULT '/images/other_images/dummy_product.jpg',   -- Image URL (default to a placeholder image if not uploaded)
    category_id INT REFERENCES categories(id) ON DELETE CASCADE
);
