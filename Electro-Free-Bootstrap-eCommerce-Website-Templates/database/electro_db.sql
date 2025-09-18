-- Electro E-commerce Database Schema
-- Created for XAMPP MySQL

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS electro_db;
CREATE DATABASE electro_db;
USE electro_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Ghana',
    postal_code VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    parent_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    category_id INT NOT NULL,
    sku VARCHAR(100) UNIQUE,
    stock_quantity INT DEFAULT 0,
    min_stock_quantity INT DEFAULT 5,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    warranty VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    views INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product images table
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product tags table
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product tags relationship table
CREATE TABLE product_tags (
    product_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_country VARCHAR(100) DEFAULT 'Ghana',
    shipping_postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- User behavior tracking table
CREATE TABLE user_behavior (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(255),
    product_id INT,
    action_type ENUM('view', 'add_to_cart', 'remove_from_cart', 'purchase', 'wishlist_add', 'wishlist_remove', 'search', 'review') NOT NULL,
    action_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Wishlist table
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Cart table (for guest users)
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL
);

-- Coupons table
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon usage tracking
CREATE TABLE coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Settings table
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data

-- Insert default admin user
INSERT INTO users (email, password, first_name, last_name, role) VALUES 
('admin@electro.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin'),
('user@electro.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo', 'User', 'user'),
('demo@electro.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo', 'Account', 'user');

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Smartphones', 'smartphones', 'Latest smartphones and mobile devices'),
('Laptops', 'laptops', 'High-performance laptops and computers'),
('Cameras', 'cameras', 'Professional and consumer cameras'),
('Accessories', 'accessories', 'Electronics accessories and peripherals'),
('Audio', 'audio', 'Headphones, speakers, and audio equipment'),
('Gaming', 'gaming', 'Gaming consoles and accessories');

-- Insert subcategories
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Apple', 'apple', 'Apple smartphones', 1),
('Samsung', 'samsung', 'Samsung smartphones', 1),
('Android', 'android', 'Android smartphones', 1),
('MacBooks', 'macbooks', 'Apple MacBooks', 2),
('Windows Laptops', 'windows-laptops', 'Windows-based laptops', 2),
('DSLR Cameras', 'dslr-cameras', 'Digital SLR cameras', 3),
('Mirrorless Cameras', 'mirrorless-cameras', 'Mirrorless cameras', 3),
('Phone Cases', 'phone-cases', 'Smartphone cases and covers', 4),
('Chargers', 'chargers', 'Charging cables and adapters', 4);

-- Insert products
INSERT INTO products (name, slug, description, short_description, price, old_price, category_id, sku, stock_quantity, brand, model, color, warranty, is_featured, rating_avg, rating_count) VALUES
('iPhone 15 Pro', 'iphone-15-pro', 'The latest iPhone with advanced camera system and A17 Pro chip', 'Apple iPhone 15 Pro 128GB', 999.00, 1099.00, 7, 'IPH15PRO-128', 50, 'Apple', 'iPhone 15 Pro', 'Natural Titanium', '1 Year', TRUE, 4.8, 156),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Samsung flagship with AI features and stunning display', 'Samsung Galaxy S24 128GB', 899.00, 999.00, 8, 'SAMS24-128', 45, 'Samsung', 'Galaxy S24', 'Onyx Black', '1 Year', TRUE, 4.6, 89),
('MacBook Pro 16"', 'macbook-pro-16', 'Professional laptop with M3 Pro chip and stunning display', 'MacBook Pro 16" M3 Pro', 2499.00, 2799.00, 10, 'MBP16-M3PRO', 25, 'Apple', 'MacBook Pro', 'Space Gray', '1 Year', TRUE, 4.9, 203),
('Dell XPS 15', 'dell-xps-15', 'Premium Windows laptop with Intel processor', 'Dell XPS 15 Intel i7', 1899.00, 2099.00, 11, 'DELLXPS15-I7', 30, 'Dell', 'XPS 15', 'Platinum Silver', '1 Year', FALSE, 4.5, 134),
('Canon EOS R6', 'canon-eos-r6', 'Professional mirrorless camera with 20MP sensor', 'Canon EOS R6 Mirrorless', 2499.00, 2599.00, 12, 'CANONR6', 15, 'Canon', 'EOS R6', 'Black', '1 Year', TRUE, 4.7, 78),
('Sony A7 III', 'sony-a7-iii', 'Full-frame mirrorless camera with 24MP sensor', 'Sony A7 III Mirrorless', 2199.00, 2299.00, 13, 'SONYA7III', 20, 'Sony', 'A7 III', 'Black', '1 Year', FALSE, 4.6, 92),
('AirPods Pro', 'airpods-pro', 'Wireless earbuds with active noise cancellation', 'Apple AirPods Pro 2nd Gen', 249.00, 279.00, 5, 'AIRPODSPRO', 100, 'Apple', 'AirPods Pro', 'White', '1 Year', TRUE, 4.7, 234),
('Samsung Galaxy Watch', 'samsung-galaxy-watch', 'Smartwatch with health monitoring features', 'Samsung Galaxy Watch 6', 349.00, 399.00, 4, 'SAMSGW6', 75, 'Samsung', 'Galaxy Watch 6', 'Black', '1 Year', FALSE, 4.4, 67);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES
(1, './img/iphone-15-pro.jpg', 'iPhone 15 Pro', TRUE),
(2, './img/samsung-galaxy-s24.jpg', 'Samsung Galaxy S24', TRUE),
(3, './img/macbook-pro.jpg', 'MacBook Pro 16"', TRUE),
(4, './img/dell-laptop.jpg', 'Dell XPS 15', TRUE),
(5, './img/camera-canon.jpg', 'Canon EOS R6', TRUE),
(6, './img/camera-sony.jpg', 'Sony A7 III', TRUE),
(7, './img/airpods-pro.jpg', 'AirPods Pro', TRUE),
(8, './img/smartwatch.jpg', 'Samsung Galaxy Watch', TRUE);

-- Insert tags
INSERT INTO tags (name, slug) VALUES
('Apple', 'apple'),
('Samsung', 'samsung'),
('Smartphone', 'smartphone'),
('Laptop', 'laptop'),
('Camera', 'camera'),
('Premium', 'premium'),
('Wireless', 'wireless'),
('Gaming', 'gaming'),
('Professional', 'professional'),
('Budget', 'budget');

-- Insert product tags
INSERT INTO product_tags (product_id, tag_id) VALUES
(1, 1), (1, 3), (1, 6),
(2, 2), (2, 3), (2, 6),
(3, 1), (3, 4), (3, 6), (3, 9),
(4, 4), (4, 9),
(5, 5), (5, 9),
(6, 5), (6, 9),
(7, 1), (7, 7),
(8, 2), (8, 7);

-- Insert settings
INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Electro', 'string', 'Website name'),
('site_description', 'Premium Electronics Store', 'string', 'Website description'),
('currency', 'GHS', 'string', 'Default currency'),
('currency_symbol', '₵', 'string', 'Currency symbol'),
('tax_rate', '12.5', 'number', 'Tax rate percentage'),
('shipping_cost', '50.00', 'number', 'Default shipping cost'),
('free_shipping_threshold', '1000.00', 'number', 'Minimum order for free shipping'),
('items_per_page', '12', 'number', 'Products per page'),
('featured_products_limit', '8', 'number', 'Number of featured products'),
('recommendations_enabled', 'true', 'boolean', 'Enable AI recommendations');

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified) VALUES
(1, 2, 5, 'Excellent phone!', 'The iPhone 15 Pro is amazing. Great camera and performance.', TRUE),
(1, 3, 4, 'Great device', 'Very good phone, but expensive. Camera quality is outstanding.', TRUE),
(2, 2, 4, 'Good Samsung phone', 'Nice features and good battery life. AI features are impressive.', TRUE),
(3, 2, 5, 'Perfect for work', 'The MacBook Pro is perfect for my development work. Fast and reliable.', TRUE),
(4, 3, 4, 'Solid laptop', 'Good performance and build quality. Windows works great.', TRUE);

-- Insert sample user behavior
INSERT INTO user_behavior (user_id, product_id, action_type, action_data) VALUES
(2, 1, 'view', '{"page": "product", "duration": 120}'),
(2, 1, 'add_to_cart', '{"quantity": 1}'),
(2, 2, 'view', '{"page": "product", "duration": 85}'),
(3, 3, 'view', '{"page": "product", "duration": 200}'),
(3, 3, 'purchase', '{"quantity": 1, "order_id": 1}'),
(2, 4, 'view', '{"page": "product", "duration": 95}'),
(2, 5, 'wishlist_add', '{"quantity": 1}');

-- Insert sample orders
INSERT INTO orders (order_number, user_id, total_amount, subtotal, tax_amount, shipping_amount, payment_method, payment_status, order_status, shipping_address, phone, email) VALUES
('ORD-2024-001', 3, 2549.00, 2499.00, 312.38, 50.00, 'mobile_money', 'paid', 'delivered', '123 Main St, Accra, Ghana', '+233244123456', 'demo@electro.com'),
('ORD-2024-002', 2, 1049.00, 999.00, 124.88, 50.00, 'credit_card', 'paid', 'processing', '456 Oak Ave, Kumasi, Ghana', '+233244789012', 'user@electro.com');

-- Insert order items
INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price) VALUES
(1, 3, 'MacBook Pro 16"', 'MBP16-M3PRO', 1, 2499.00, 2499.00),
(2, 1, 'iPhone 15 Pro', 'IPH15PRO-128', 1, 999.00, 999.00);

-- Insert wishlist items
INSERT INTO wishlist (user_id, product_id) VALUES
(2, 5),
(2, 7),
(3, 2);

-- Insert newsletter subscribers
INSERT INTO newsletter_subscribers (email, first_name, last_name) VALUES
('newsletter@example.com', 'News', 'Letter'),
('subscriber@example.com', 'Demo', 'Subscriber');

-- Insert sample coupons
INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order_amount, usage_limit) VALUES
('WELCOME10', 'Welcome Discount', '10% off for new customers', 'percentage', 10.00, 100.00, 100),
('SAVE50', 'Save 50 GHS', '50 GHS off on orders above 500 GHS', 'fixed', 50.00, 500.00, 50);

-- Update product ratings based on reviews
UPDATE products p SET 
    rating_avg = (
        SELECT AVG(rating) 
        FROM reviews r 
        WHERE r.product_id = p.id AND r.is_approved = TRUE
    ),
    rating_count = (
        SELECT COUNT(*) 
        FROM reviews r 
        WHERE r.product_id = p.id AND r.is_approved = TRUE
    )
WHERE EXISTS (SELECT 1 FROM reviews r WHERE r.product_id = p.id);
