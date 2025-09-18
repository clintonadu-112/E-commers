// Electro eCommerce - Quick View Modal System
// Handles quick view functionality for products

class QuickViewSystem {
    constructor() {
        this.currentProduct = null;
        this.currentImageIndex = 0;
        this.init();
    }

    // Initialize quick view system
    init() {
        this.createModal();
        this.bindEvents();
    }

    // Create modal HTML
    createModal() {
        const modalHTML = `
            <div id="quick-view-modal" class="quick-view-modal">
                <div class="quick-view-content">
                    <span class="quick-view-close">&times;</span>
                    <div class="quick-view-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="quick-view-gallery">
                                    <img id="quick-view-main-image" class="quick-view-main-image" src="" alt="Product Image">
                                    <div class="quick-view-thumbnails" id="quick-view-thumbnails">
                                        <!-- Thumbnails will be loaded here -->
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="quick-view-details">
                                    <h2 id="quick-view-title"></h2>
                                    <div class="quick-view-price">
                                        <span id="quick-view-current-price"></span>
                                        <span id="quick-view-old-price" class="quick-view-old-price"></span>
                                    </div>
                                    <div class="quick-view-rating" id="quick-view-rating">
                                        <!-- Rating stars will be loaded here -->
                                    </div>
                                    <div class="quick-view-description" id="quick-view-description"></div>
                                    
                                    <div class="quick-view-options">
                                        <div class="quick-view-option">
                                            <label for="quick-view-size">Size</label>
                                            <select id="quick-view-size" class="input-select">
                                                <option value="">Select Size</option>
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="large">Large</option>
                                            </select>
                                        </div>
                                        <div class="quick-view-option">
                                            <label for="quick-view-color">Color</label>
                                            <select id="quick-view-color" class="input-select">
                                                <option value="">Select Color</option>
                                                <option value="black">Black</option>
                                                <option value="white">White</option>
                                                <option value="red">Red</option>
                                                <option value="blue">Blue</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="quick-view-actions">
                                        <div class="quick-view-qty">
                                            <label>Qty:</label>
                                            <input type="number" id="quick-view-qty" value="1" min="1" max="99">
                                        </div>
                                        <button class="quick-view-btn quick-view-btn-primary" id="quick-view-add-cart">
                                            <i class="fa fa-shopping-cart"></i> Add to Cart
                                        </button>
                                        <button class="quick-view-btn quick-view-btn-secondary" id="quick-view-add-wishlist">
                                            <i class="fa fa-heart-o"></i> Wishlist
                                        </button>
                                        <button class="quick-view-btn quick-view-btn-secondary" id="quick-view-add-compare">
                                            <i class="fa fa-exchange"></i> Compare
                                        </button>
                                    </div>
                                    
                                    <div class="quick-view-features">
                                        <h4>Key Features</h4>
                                        <ul class="quick-view-feature-list" id="quick-view-features">
                                            <!-- Features will be loaded here -->
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHTML);
    }

    // Bind events
    bindEvents() {
        // Close modal
        $('.quick-view-close, #quick-view-modal').on('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Escape key to close
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape' && $('#quick-view-modal').is(':visible')) {
                this.closeModal();
            }
        });

        // Add to cart
        $('#quick-view-add-cart').on('click', () => {
            this.addToCart();
        });

        // Add to wishlist
        $('#quick-view-add-wishlist').on('click', () => {
            this.addToWishlist();
        });

        // Add to compare
        $('#quick-view-add-compare').on('click', () => {
            this.addToCompare();
        });

        // Quantity change
        $('#quick-view-qty').on('change', (e) => {
            const qty = parseInt(e.target.value);
            if (qty < 1) {
                e.target.value = 1;
            } else if (qty > 99) {
                e.target.value = 99;
            }
        });
    }

    // Get product data by ID
    getProductData(productId) {
        const products = {
            'iphone-15-pro': {
                id: 'iphone-15-pro',
                name: 'iPhone 15 Pro',
                category: 'Smartphones',
                price: 999.00,
                oldPrice: 1099.00,
                rating: 4.8,
                reviewCount: 156,
                description: 'The iPhone 15 Pro features the most advanced camera system ever on an iPhone, with a 48MP Main camera and the new A17 Pro chip for incredible performance.',
                images: [
                    './img/iphone-15-pro.jpg',
                    './img/product01.png',
                    './img/product03.png',
                    './img/product06.png'
                ],
                features: {
                    'Display': '6.1" Super Retina XDR',
                    'Processor': 'A17 Pro chip',
                    'Storage': '128GB, 256GB, 512GB, 1TB',
                    'Camera': '48MP Main + 12MP Ultra Wide',
                    'Battery': 'Up to 23 hours video playback',
                    'OS': 'iOS 17',
                    'Weight': '187g',
                    'Colors': 'Natural Titanium, Blue Titanium, White Titanium, Black Titanium'
                }
            },
            'samsung-galaxy-s24': {
                id: 'samsung-galaxy-s24',
                name: 'Samsung Galaxy S24',
                category: 'Smartphones',
                price: 899.00,
                oldPrice: 999.00,
                rating: 4.6,
                reviewCount: 89,
                description: 'Experience the future with the Samsung Galaxy S24, featuring cutting-edge AI capabilities and the most advanced mobile technology.',
                images: [
                    './img/samsung-galaxy-s24.jpg',
                    './img/product02.png',
                    './img/product04.png',
                    './img/product05.png'
                ],
                features: {
                    'Display': '6.2" Dynamic AMOLED 2X',
                    'Processor': 'Snapdragon 8 Gen 3',
                    'Storage': '128GB, 256GB, 512GB',
                    'Camera': '50MP Main + 12MP Ultra Wide',
                    'Battery': '4000mAh',
                    'OS': 'Android 14, One UI 6.1',
                    'Weight': '167g',
                    'Colors': 'Onyx Black, Marble Gray, Cobalt Violet, Amber Yellow'
                }
            },
            'macbook-pro': {
                id: 'macbook-pro',
                name: 'MacBook Pro 16"',
                category: 'Laptops',
                price: 2499.00,
                oldPrice: 2799.00,
                rating: 4.9,
                reviewCount: 203,
                description: 'The most powerful MacBook Pro ever. With the M3 Pro chip, you can tackle pro projects and creative workflows with incredible speed.',
                images: [
                    './img/macbook-pro.jpg',
                    './img/product07.png',
                    './img/product08.png',
                    './img/product09.png'
                ],
                features: {
                    'Display': '16.2" Liquid Retina XDR',
                    'Processor': 'M3 Pro chip',
                    'Storage': '512GB, 1TB, 2TB, 4TB, 8TB',
                    'Memory': '18GB, 36GB, 96GB unified memory',
                    'Battery': 'Up to 22 hours',
                    'OS': 'macOS Sonoma',
                    'Weight': '2.1kg',
                    'Ports': '3 Thunderbolt 4, HDMI, SDXC card slot, MagSafe 3'
                }
            },
            'dell-laptop': {
                id: 'dell-laptop',
                name: 'Dell XPS 15',
                category: 'Laptops',
                price: 1899.00,
                oldPrice: 2099.00,
                rating: 4.5,
                reviewCount: 134,
                description: 'The Dell XPS 15 combines stunning design with powerful performance, perfect for creative professionals and power users.',
                images: [
                    './img/dell-laptop.jpg',
                    './img/product01.png',
                    './img/product03.png',
                    './img/product06.png'
                ],
                features: {
                    'Display': '15.6" 4K OLED',
                    'Processor': 'Intel Core i7-13700H',
                    'Storage': '512GB, 1TB, 2TB SSD',
                    'Memory': '16GB, 32GB DDR5',
                    'Battery': '86Whr',
                    'OS': 'Windows 11 Pro',
                    'Weight': '1.8kg',
                    'Ports': '2 Thunderbolt 4, HDMI 2.0, SD card reader'
                }
            },
            'camera-canon': {
                id: 'camera-canon',
                name: 'Canon EOS R6',
                category: 'Cameras',
                price: 2499.00,
                oldPrice: 2599.00,
                rating: 4.7,
                reviewCount: 78,
                description: 'The Canon EOS R6 delivers exceptional image quality and performance for both photography and videography.',
                images: [
                    './img/camera-canon.jpg',
                    './img/product02.png',
                    './img/product04.png',
                    './img/product05.png'
                ],
                features: {
                    'Sensor': '20.1MP Full-Frame CMOS',
                    'Video': '4K 60p, Full HD 120p',
                    'ISO': '100-102400',
                    'AF': 'Dual Pixel CMOS AF II',
                    'Battery': 'LP-E6NH (360 shots)',
                    'Weight': '670g',
                    'Connectivity': 'Wi-Fi, Bluetooth',
                    'Storage': 'Dual SD card slots'
                }
            },
            'camera-sony': {
                id: 'camera-sony',
                name: 'Sony A7 III',
                category: 'Cameras',
                price: 1999.00,
                oldPrice: 2199.00,
                rating: 4.8,
                reviewCount: 112,
                description: 'The Sony A7 III offers professional-grade performance in a compact mirrorless body, perfect for both photography and video.',
                images: [
                    './img/camera-sony.jpg',
                    './img/product07.png',
                    './img/product08.png',
                    './img/product09.png'
                ],
                features: {
                    'Sensor': '24.2MP Full-Frame CMOS',
                    'Video': '4K 30p, Full HD 120p',
                    'ISO': '100-51200',
                    'AF': '693-point phase detection',
                    'Battery': 'NP-FZ100 (610 shots)',
                    'Weight': '650g',
                    'Connectivity': 'Wi-Fi, NFC, Bluetooth',
                    'Storage': 'Dual SD card slots'
                }
            },
            'airpods-pro': {
                id: 'airpods-pro',
                name: 'AirPods Pro',
                category: 'Accessories',
                price: 249.00,
                oldPrice: 279.00,
                rating: 4.6,
                reviewCount: 234,
                description: 'AirPods Pro deliver Active Noise Cancellation for immersive sound, Transparency mode to hear the world around you, and Adaptive EQ for superior audio quality.',
                images: [
                    './img/airpods-pro.jpg',
                    './img/product01.png',
                    './img/product03.png',
                    './img/product06.png'
                ],
                features: {
                    'Type': 'Wireless Earbuds',
                    'Noise Cancellation': 'Active Noise Cancellation',
                    'Battery': 'Up to 4.5 hours',
                    'Connectivity': 'Bluetooth 5.0',
                    'Water Resistance': 'IPX4',
                    'Weight': '5.4g per earbud',
                    'Case': 'Wireless charging case',
                    'Compatibility': 'iPhone, iPad, Mac, Apple Watch'
                }
            },
            'headphones': {
                id: 'headphones',
                name: 'Sony WH-1000XM4',
                category: 'Accessories',
                price: 349.00,
                oldPrice: 399.00,
                rating: 4.7,
                reviewCount: 189,
                description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo.',
                images: [
                    './img/headphones.jpg',
                    './img/product02.png',
                    './img/product04.png',
                    './img/product05.png'
                ],
                features: {
                    'Type': 'Wireless Over-Ear',
                    'Noise Cancellation': 'Industry-leading ANC',
                    'Battery': 'Up to 30 hours',
                    'Connectivity': 'Bluetooth 5.0, NFC',
                    'Weight': '254g',
                    'Foldable': 'Yes',
                    'Touch Controls': 'Yes',
                    'Compatibility': 'All Bluetooth devices'
                }
            }
        };

        return products[productId] || null;
    }

    // Open quick view modal
    openQuickView(productId) {
        const product = this.getProductData(productId);
        if (!product) {
            this.showNotification('Product not found', 'error');
            return;
        }

        this.currentProduct = product;
        this.currentImageIndex = 0;
        this.loadProductData(product);
        this.showModal();
    }

    // Load product data into modal
    loadProductData(product) {
        // Set basic info
        $('#quick-view-title').text(product.name);
        $('#quick-view-current-price').text(`₵${product.price.toFixed(2)}`);
        
        if (product.oldPrice) {
            $('#quick-view-old-price').text(`₵${product.oldPrice.toFixed(2)}`).show();
        } else {
            $('#quick-view-old-price').hide();
        }

        // Set rating
        $('#quick-view-rating').html(`
            ${this.generateStars(product.rating)}
            <span>(${product.reviewCount} reviews)</span>
        `);

        // Set description
        $('#quick-view-description').text(product.description);

        // Load images
        this.loadProductImages(product.images);

        // Load features
        this.loadProductFeatures(product.features);

        // Reset form
        $('#quick-view-qty').val(1);
        $('#quick-view-size').val('');
        $('#quick-view-color').val('');
    }

    // Load product images
    loadProductImages(images) {
        const mainImage = $('#quick-view-main-image');
        const thumbnailsContainer = $('#quick-view-thumbnails');
        
        // Set main image
        mainImage.attr('src', images[0]);
        mainImage.attr('alt', 'Product Image');
        
        // Load thumbnails
        thumbnailsContainer.empty();
        images.forEach((image, index) => {
            const thumbnail = $(`
                <img src="${image}" alt="Thumbnail ${index + 1}" 
                     class="quick-view-thumbnail ${index === 0 ? 'active' : ''}"
                     data-index="${index}"
                     onerror="this.onerror=null;this.src='https://placehold.co/60x60/E4E7ED/333333?text=Thumb';">
            `);
            
            thumbnail.on('click', () => {
                this.changeImage(index);
            });
            
            thumbnailsContainer.append(thumbnail);
        });
    }

    // Change main image
    changeImage(index) {
        const product = this.currentProduct;
        if (!product || !product.images[index]) return;

        $('#quick-view-main-image').attr('src', product.images[index]);
        $('.quick-view-thumbnail').removeClass('active');
        $(`.quick-view-thumbnail[data-index="${index}"]`).addClass('active');
        this.currentImageIndex = index;
    }

    // Load product features
    loadProductFeatures(features) {
        const featuresContainer = $('#quick-view-features');
        featuresContainer.empty();

        Object.entries(features).forEach(([label, value]) => {
            featuresContainer.append(`
                <li>
                    <span class="quick-view-feature-label">${label}:</span>
                    <span class="quick-view-feature-value">${value}</span>
                </li>
            `);
        });
    }

    // Generate stars HTML
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fa fa-star"></i>';
        }
        if (hasHalfStar) {
            starsHTML += '<i class="fa fa-star-half-o"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="fa fa-star-o"></i>';
        }

        return starsHTML;
    }

    // Show modal
    showModal() {
        $('#quick-view-modal').fadeIn(300);
        $('body').addClass('modal-open');
    }

    // Close modal
    closeModal() {
        $('#quick-view-modal').fadeOut(300);
        $('body').removeClass('modal-open');
        this.currentProduct = null;
    }

    // Add to cart
    addToCart() {
        if (!this.currentProduct) return;

        const qty = parseInt($('#quick-view-qty').val()) || 1;
        const size = $('#quick-view-size').val();
        const color = $('#quick-view-color').val();

        // Add to cart logic (using existing cart system)
        const cartItem = {
            id: this.currentProduct.id,
            name: this.currentProduct.name,
            price: this.currentProduct.price,
            quantity: qty,
            image: this.currentProduct.images[0],
            size: size,
            color: color
        };

        // Use existing cart functionality
        if (typeof addToCartHandler === 'function') {
            addToCartHandler(null, this.currentProduct.id, qty, size, color);
        }

        this.showNotification('Product added to cart!', 'success');
        this.closeModal();
    }

    // Add to wishlist
    addToWishlist() {
        if (!this.currentProduct) return;

        // Use existing wishlist functionality
        if (typeof addToWishlist === 'function') {
            addToWishlist(null, this.currentProduct.id);
        }

        this.showNotification('Product added to wishlist!', 'success');
    }

    // Add to compare
    addToCompare() {
        if (!this.currentProduct) return;

        // Use existing compare functionality
        if (typeof addToCompare === 'function') {
            addToCompare(null, this.currentProduct.id);
        }

        this.showNotification('Product added to compare!', 'success');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'}`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '10000';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize quick view system
const quickViewSystem = new QuickViewSystem();

// Global function for quick view
function quickView(event, productId) {
    event.preventDefault();
    event.stopPropagation();
    
    quickViewSystem.openQuickView(productId);
}

// Export for global access
window.quickViewSystem = quickViewSystem;
window.quickView = quickView; 