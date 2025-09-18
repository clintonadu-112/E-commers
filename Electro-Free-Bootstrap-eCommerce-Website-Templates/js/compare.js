// Electro eCommerce - Product Comparison System
// Handles product comparison functionality

class CompareSystem {
    constructor() {
        this.compareList = this.loadCompareList();
        this.maxCompareItems = 4;
        this.init();
    }

    // Load compare list from localStorage
    loadCompareList() {
        const compareList = localStorage.getItem('compareList');
        return compareList ? JSON.parse(compareList) : [];
    }

    // Save compare list to localStorage
    saveCompareList() {
        localStorage.setItem('compareList', JSON.stringify(this.compareList));
        this.updateCompareCount();
    }

    // Add product to compare list
    addToCompare(productId) {
        if (this.compareList.length >= this.maxCompareItems) {
            this.showNotification('Maximum 4 products can be compared at once', 'warning');
            return false;
        }

        if (this.compareList.includes(productId)) {
            this.showNotification('Product already in compare list', 'info');
            return false;
        }

        this.compareList.push(productId);
        this.saveCompareList();
        this.showNotification('Product added to compare list', 'success');
        return true;
    }

    // Remove product from compare list
    removeFromCompare(productId) {
        const index = this.compareList.indexOf(productId);
        if (index > -1) {
            this.compareList.splice(index, 1);
            this.saveCompareList();
            this.showNotification('Product removed from compare list', 'success');
            return true;
        }
        return false;
    }

    // Clear compare list
    clearCompareList() {
        this.compareList = [];
        this.saveCompareList();
        this.showNotification('Compare list cleared', 'success');
        this.renderComparePage();
    }

    // Update compare count in navigation
    updateCompareCount() {
        const compareCount = this.compareList.length;
        $('.compare-count').text(compareCount);
        
        // Update compare button text
        $('.compare-btn').text(`Compare (${compareCount})`);
        
        // Show/hide compare button based on count
        if (compareCount > 0) {
            $('.compare-btn').show();
        } else {
            $('.compare-btn').hide();
        }
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
                image: './img/iphone-15-pro.jpg',
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
                image: './img/samsung-galaxy-s24.jpg',
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
                image: './img/macbook-pro.jpg',
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
                image: './img/dell-laptop.jpg',
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
                image: './img/camera-canon.jpg',
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
                image: './img/camera-sony.jpg',
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
                image: './img/airpods-pro.jpg',
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
                image: './img/headphones.jpg',
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

    // Generate comparison table
    generateCompareTable() {
        if (this.compareList.length === 0) {
            $('#compare-table').hide();
            $('#empty-compare').show();
            $('#compare-summary').hide();
            return;
        }

        $('#compare-table').show();
        $('#empty-compare').hide();
        $('#compare-summary').show();

        const products = this.compareList.map(id => this.getProductData(id)).filter(Boolean);
        
        if (products.length === 0) {
            $('#compare-table').hide();
            $('#empty-compare').show();
            return;
        }

        // Update headers
        products.forEach((product, index) => {
            $(`#product-${index + 1}-header`).html(`
                <div>
                    <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.onerror=null;this.src='https://placehold.co/80x80/E4E7ED/333333?text=Product';">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">₵${product.price.toFixed(2)}</div>
                    ${product.oldPrice ? `<div class="product-old-price">₵${product.oldPrice.toFixed(2)}</div>` : ''}
                    <div class="rating-stars">${this.generateStars(product.rating)}</div>
                    <div class="compare-actions">
                        <button class="btn btn-sm btn-danger" onclick="compareSystem.removeFromCompare('${product.id}')">
                            <i class="fa fa-times"></i> Remove
                        </button>
                    </div>
                </div>
            `);
        });

        // Hide unused columns
        for (let i = products.length + 1; i <= 4; i++) {
            $(`#product-${i}-header`).hide();
        }

        // Generate comparison rows
        const tbody = $('#compare-tbody');
        tbody.empty();

        // Get all unique features
        const allFeatures = new Set();
        products.forEach(product => {
            Object.keys(product.features).forEach(feature => allFeatures.add(feature));
        });

        // Create comparison rows
        Array.from(allFeatures).forEach(feature => {
            const row = $('<tr>');
            row.append(`<td><strong>${feature}</strong></td>`);
            
            products.forEach(product => {
                const value = product.features[feature] || 'N/A';
                row.append(`<td class="feature-value">${value}</td>`);
            });

            // Fill empty cells for unused columns
            for (let i = products.length; i < 4; i++) {
                row.append('<td>-</td>');
            }

            tbody.append(row);
        });

        // Generate summary
        this.generateCompareSummary(products);
    }

    // Generate comparison summary
    generateCompareSummary(products) {
        if (products.length === 0) return;

        // Find best price
        const bestPrice = products.reduce((min, product) => 
            product.price < min.price ? product : min
        );

        // Find best rating
        const bestRating = products.reduce((max, product) => 
            product.rating > max.rating ? product : max
        );

        // Find best value (price/rating ratio)
        const bestValue = products.reduce((best, product) => {
            const valueRatio = product.rating / product.price;
            const bestRatio = best.rating / best.price;
            return valueRatio > bestRatio ? product : best;
        });

        $('#best-price').text(`${bestPrice.name} - ₵${bestPrice.price.toFixed(2)}`);
        $('#best-rating').text(`${bestRating.name} - ${bestRating.rating}/5`);
        $('#best-value').text(`${bestValue.name} - Best bang for buck`);
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

    // Load suggested products
    loadSuggestedProducts() {
        const allProducts = [
            'iphone-15-pro', 'samsung-galaxy-s24', 'macbook-pro', 'dell-laptop',
            'camera-canon', 'camera-sony', 'airpods-pro', 'headphones'
        ];

        const availableProducts = allProducts.filter(id => !this.compareList.includes(id));
        const suggestedProducts = availableProducts.slice(0, 8);

        const container = $('#suggested-products');
        container.empty();

        suggestedProducts.forEach(productId => {
            const product = this.getProductData(productId);
            if (product) {
                const productHtml = `
                    <div class="col-md-3 col-sm-6">
                        <div class="product-suggestion" onclick="compareSystem.addToCompare('${product.id}')">
                            <div class="row">
                                <div class="col-xs-4">
                                    <img src="${product.image}" alt="${product.name}" class="suggestion-image" onerror="this.onerror=null;this.src='https://placehold.co/50x50/E4E7ED/333333?text=Product';">
                                </div>
                                <div class="col-xs-8 suggestion-details">
                                    <h5>${product.name}</h5>
                                    <div class="suggestion-price">₵${product.price.toFixed(2)}</div>
                                    <small>Click to add</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.append(productHtml);
            }
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'}`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Render compare page
    renderComparePage() {
        this.generateCompareTable();
        this.loadSuggestedProducts();
        this.updateCompareCount();
    }

    // Initialize compare system
    init() {
        this.updateCompareCount();
        
        // Add compare button to navigation if not exists
        if ($('.compare-btn').length === 0) {
            $('.header-ctn').append(`
                <div class="compare-btn" style="display: none;">
                    <a href="./compare.html">
                        <i class="fa fa-exchange"></i>
                        <span>Compare (0)</span>
                    </a>
                </div>
            `);
        }

        // If on compare page, render it
        if (window.location.pathname.includes('compare.html')) {
            this.renderComparePage();
        }
    }
}

// Initialize compare system
const compareSystem = new CompareSystem();

// Global function for adding to compare
function addToCompare(event, productId) {
    event.preventDefault();
    event.stopPropagation();
    
    if (compareSystem.addToCompare(productId)) {
        // Update compare button
        compareSystem.updateCompareCount();
        
        // If on compare page, re-render
        if (window.location.pathname.includes('compare.html')) {
            compareSystem.renderComparePage();
        }
    }
}

// Global function for removing from compare
function removeFromCompare(productId) {
    if (compareSystem.removeFromCompare(productId)) {
        compareSystem.renderComparePage();
    }
}

// Export for global access
window.compareSystem = compareSystem;
window.addToCompare = addToCompare;
window.removeFromCompare = removeFromCompare; 