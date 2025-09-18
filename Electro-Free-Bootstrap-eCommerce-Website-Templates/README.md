# Electro E-commerce Website

A modern, responsive e-commerce website built with HTML, CSS, JavaScript, and PHP with MySQL database. Features AI-powered recommendations, user authentication, shopping cart, and admin panel.

## 🚀 Features

### Frontend
- **Responsive Design** - Mobile-first approach with Bootstrap
- **Modern UI** - Beautiful gradients and smooth animations
- **Product Catalog** - Browse products by category
- **Advanced Search** - Filter by price, brand, rating
- **Shopping Cart** - Add/remove items with quantity control
- **Wishlist** - Save favorite products
- **User Authentication** - Login, register, profile management
- **Checkout Process** - Multi-step payment flow
- **Product Reviews** - Rating and review system

### Backend (PHP/MySQL)
- **RESTful API** - Complete API for all functionality
- **User Management** - Registration, authentication, profiles
- **Product Management** - CRUD operations with images
- **Order Processing** - Complete order lifecycle
- **AI Recommendations** - Collaborative filtering and content-based
- **Payment Integration** - Multiple payment methods
- **Email System** - Order confirmations and notifications

### AI-Powered Features
- **Collaborative Filtering** - User behavior analysis
- **Content-Based Filtering** - Product similarity matching
- **Trending Products** - Popular items algorithm
- **Frequently Bought Together** - Cross-selling recommendations
- **Personalized Suggestions** - User-specific recommendations

## 📋 Requirements

- **XAMPP** (Apache + MySQL + PHP)
- **PHP 7.4+** with PDO and MySQL extensions
- **MySQL 5.7+** or MariaDB 10.2+
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

### 1. Download and Extract
```bash
# Download the project files
# Extract to your XAMPP htdocs directory
C:\xampp\htdocs\electro\
```

### 2. Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Verify both services are running (green status)

### 3. Setup Database
```bash
# Navigate to project directory
cd C:\xampp\htdocs\electro\

# Run the setup script
php setup.php
```

### 4. Access the Website
- **Main Site**: http://localhost/electro/
- **Admin Panel**: http://localhost/electro/admin-panel.html

## 👤 Demo Accounts

### Admin Account
- **Email**: `admin@electro.com`
- **Password**: `admin123`
- **Access**: Full admin capabilities

### User Accounts
- **Email**: `user@electro.com`
- **Password**: `user123`
- **Email**: `demo@electro.com`
- **Password**: `demo123`

## 📁 Project Structure

```
electro/
├── index.html                 # Homepage
├── product.html              # Product details
├── cart.html                 # Shopping cart
├── checkout.html             # Checkout process
├── login.html               # User login
├── register.html            # User registration
├── profile.html             # User profile
├── admin-panel.html         # Admin dashboard
├── recommendations-demo.html # AI recommendations demo
├── css/                     # Stylesheets
│   ├── style.css           # Main styles
│   ├── bootstrap.min.css   # Bootstrap framework
│   └── font-awesome.min.css # Icons
├── js/                      # JavaScript files
│   ├── api.js              # API integration
│   ├── recommendations.js  # AI recommendations
│   ├── email-service.js    # Email functionality
│   └── main.js            # Main functionality
├── api/                     # PHP API endpoints
│   ├── products.php        # Product management
│   ├── auth.php           # Authentication
│   ├── orders.php         # Order processing
│   └── recommendations.php # AI recommendations
├── config/                  # Configuration
│   └── database.php       # Database settings
├── database/               # Database files
│   └── electro_db.sql     # Database schema
├── img/                    # Product images
├── uploads/               # User uploads
└── setup.php              # Setup script
```

## 🔧 API Endpoints

### Products
- `GET /api/products.php` - Get all products
- `GET /api/products.php?id=1` - Get product by ID
- `GET /api/products.php?search=iphone` - Search products
- `GET /api/products.php?featured=1` - Get featured products

### Authentication
- `POST /api/auth.php?action=register` - User registration
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=logout` - User logout
- `GET /api/auth.php?action=me` - Get current user

### Orders
- `POST /api/orders.php?action=create` - Create order
- `GET /api/orders.php` - Get user orders
- `GET /api/orders.php?id=1` - Get order by ID

### Recommendations
- `GET /api/recommendations.php` - Get personalized recommendations
- `GET /api/recommendations.php?action=trending` - Get trending products
- `POST /api/recommendations.php?action=track` - Track user behavior

## 🎨 Customization

### Styling
- Edit `css/style.css` for custom styles
- Modify color scheme in CSS variables
- Update fonts in Google Fonts import

### Database
- Modify `config/database.php` for database settings
- Add new products in `database/electro_db.sql`
- Update categories and tags as needed

### API
- Extend API endpoints in `api/` directory
- Add new features in respective PHP files
- Modify authentication logic in `auth.php`

## 🔒 Security Features

- **Password Hashing** - Secure password storage
- **SQL Injection Protection** - Prepared statements
- **XSS Prevention** - Input sanitization
- **CSRF Protection** - Session-based tokens
- **Input Validation** - Server-side validation

## 📱 Mobile Responsive

- **Bootstrap Grid** - Responsive layout system
- **Touch-Friendly** - Mobile-optimized interactions
- **Progressive Web App** - PWA capabilities
- **Cross-Browser** - Works on all modern browsers

## 🚀 Performance

- **Optimized Images** - Compressed product images
- **Minified CSS/JS** - Reduced file sizes
- **Database Indexing** - Fast query performance
- **Caching** - Browser and server caching

## 🛍️ E-commerce Features

### Product Management
- **Categories** - Organized product hierarchy
- **Tags** - Flexible product tagging
- **Images** - Multiple product images
- **Variants** - Product options and variants

### Shopping Experience
- **Search** - Advanced product search
- **Filtering** - Price, brand, rating filters
- **Sorting** - Multiple sort options
- **Pagination** - Large catalog support

### Checkout Process
- **Cart Management** - Add/remove items
- **Address Management** - Shipping/billing addresses
- **Payment Methods** - Multiple payment options
- **Order Confirmation** - Email notifications

## 🤖 AI Recommendations

### Algorithm Types
1. **Collaborative Filtering** - User similarity analysis
2. **Content-Based Filtering** - Product similarity matching
3. **Trending Products** - Popularity-based recommendations
4. **Frequently Bought Together** - Association rules
5. **Personalized Suggestions** - User-specific recommendations

### Implementation
- **User Behavior Tracking** - View, purchase, wishlist actions
- **Real-time Analysis** - Dynamic recommendation updates
- **Performance Metrics** - Recommendation effectiveness tracking

## 📊 Admin Panel

### Dashboard Features
- **Sales Analytics** - Revenue and order statistics
- **User Management** - Customer account management
- **Product Management** - Inventory and product details
- **Order Management** - Order status and tracking
- **System Settings** - Site configuration

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check XAMPP MySQL service
# Verify database credentials in config/database.php
# Ensure MySQL is running on port 3306
```

#### API Not Working
```bash
# Check Apache service is running
# Verify file permissions
# Check PHP error logs
```

#### Images Not Loading
```bash
# Verify image paths in database
# Check file permissions on img/ directory
# Ensure images exist in correct location
```

### Debug Mode
```php
// Enable debug mode in config/database.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📈 Future Enhancements

### Planned Features
- **Multi-language Support** - Internationalization
- **Advanced Analytics** - Detailed reporting
- **Mobile App** - Native mobile application
- **Payment Gateway** - Real payment processing
- **Inventory Management** - Stock tracking
- **Email Marketing** - Newsletter campaigns

### Technical Improvements
- **API Versioning** - Versioned API endpoints
- **Rate Limiting** - API request throttling
- **Caching Layer** - Redis/Memcached integration
- **Microservices** - Service-oriented architecture
- **Docker Support** - Containerized deployment

## 📄 License

This project is for educational and demonstration purposes. Feel free to use and modify for your own projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- **Email**: support@electro.com
- **Documentation**: Check this README
- **Issues**: Report bugs via GitHub issues

---

**Electro E-commerce** - Modern, AI-powered online shopping experience
