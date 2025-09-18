// Electro eCommerce - Product Recommendation System
// AI-powered recommendations, collaborative filtering, and personalized suggestions

class RecommendationEngine {
    constructor() {
        this.userBehavior = this.loadUserBehavior();
        this.productData = this.loadProductData();
        this.recommendationTypes = {
            COLLABORATIVE: 'collaborative',
            CONTENT_BASED: 'content_based',
            TRENDING: 'trending',
            PERSONALIZED: 'personalized',
            FREQUENTLY_BOUGHT: 'frequently_bought'
        };
    }

    // Load user behavior data from localStorage
    loadUserBehavior() {
        const behavior = localStorage.getItem('userBehavior') || '{}';
        return JSON.parse(behavior);
    }

    // Save user behavior data
    saveUserBehavior() {
        localStorage.setItem('userBehavior', JSON.stringify(this.userBehavior));
    }

    // Load product data
    loadProductData() {
        return {
            products: [
                {
                    id: 'iphone-15-pro',
                    name: 'iPhone 15 Pro',
                    category: 'smartphones',
                    price: 999.00,
                    oldPrice: 1099.00,
                    rating: 4.8,
                    reviewCount: 156,
                    tags: ['apple', 'smartphone', 'camera', 'premium'],
                    image: './img/iphone-15-pro.jpg',
                    sales: 245,
                    views: 1200
                },
                {
                    id: 'samsung-galaxy-s24',
                    name: 'Samsung Galaxy S24',
                    category: 'smartphones',
                    price: 899.00,
                    oldPrice: 999.00,
                    rating: 4.6,
                    reviewCount: 89,
                    tags: ['samsung', 'smartphone', 'android', 'camera'],
                    image: './img/samsung-galaxy-s24.jpg',
                    sales: 189,
                    views: 980
                },
                {
                    id: 'macbook-pro',
                    name: 'MacBook Pro 16"',
                    category: 'laptops',
                    price: 2499.00,
                    oldPrice: 2799.00,
                    rating: 4.9,
                    reviewCount: 203,
                    tags: ['apple', 'laptop', 'premium', 'performance'],
                    image: './img/macbook-pro.jpg',
                    sales: 156,
                    views: 890
                },
                {
                    id: 'dell-laptop',
                    name: 'Dell XPS 15',
                    category: 'laptops',
                    price: 1899.00,
                    oldPrice: 2099.00,
                    rating: 4.5,
                    reviewCount: 134,
                    tags: ['dell', 'laptop', 'windows', 'performance'],
                    image: './img/dell-laptop.jpg',
                    sales: 98,
                    views: 650
                },
                {
                    id: 'camera-canon',
                    name: 'Canon EOS R6',
                    category: 'cameras',
                    price: 2499.00,
                    oldPrice: 2599.00,
                    rating: 4.7,
                    reviewCount: 78,
                    tags: ['canon', 'camera', 'mirrorless', 'professional'],
                    image: './img/camera-canon.jpg',
                    sales: 67,
                    views: 420
                },
                {
                    id: 'camera-sony',
                    name: 'Sony A7 III',
                    category: 'cameras',
                    price: 1999.00,
                    oldPrice: 2199.00,
                    rating: 4.8,
                    reviewCount: 112,
                    tags: ['sony', 'camera', 'mirrorless', 'professional'],
                    image: './img/camera-sony.jpg',
                    sales: 89,
                    views: 580
                },
                {
                    id: 'airpods-pro',
                    name: 'AirPods Pro',
                    category: 'accessories',
                    price: 249.00,
                    oldPrice: 279.00,
                    rating: 4.6,
                    reviewCount: 234,
                    tags: ['apple', 'headphones', 'wireless', 'noise-cancelling'],
                    image: './img/airpods-pro.jpg',
                    sales: 312,
                    views: 1500
                },
                {
                    id: 'headphones',
                    name: 'Sony WH-1000XM4',
                    category: 'accessories',
                    price: 349.00,
                    oldPrice: 399.00,
                    rating: 4.7,
                    reviewCount: 189,
                    tags: ['sony', 'headphones', 'wireless', 'noise-cancelling'],
                    image: './img/headphones.jpg',
                    sales: 156,
                    views: 890
                },
                {
                    id: 'smartwatch',
                    name: 'Apple Watch Series 9',
                    category: 'accessories',
                    price: 399.00,
                    oldPrice: 449.00,
                    rating: 4.8,
                    reviewCount: 167,
                    tags: ['apple', 'smartwatch', 'fitness', 'health'],
                    image: './img/smartwatch.jpg',
                    sales: 223,
                    views: 1100
                },
                {
                    id: 'wireless-charger',
                    name: 'Wireless Charging Pad',
                    category: 'accessories',
                    price: 49.00,
                    oldPrice: 59.00,
                    rating: 4.3,
                    reviewCount: 89,
                    tags: ['wireless', 'charging', 'accessory', 'convenient'],
                    image: './img/wireless-charger.jpg',
                    sales: 445,
                    views: 1200
                }
            ],
            // Frequently bought together combinations
            frequentlyBoughtTogether: {
                'iphone-15-pro': ['airpods-pro', 'wireless-charger', 'smartwatch'],
                'samsung-galaxy-s24': ['headphones', 'wireless-charger'],
                'macbook-pro': ['airpods-pro', 'wireless-charger'],
                'camera-canon': ['headphones', 'smartwatch'],
                'airpods-pro': ['iphone-15-pro', 'smartwatch'],
                'smartwatch': ['iphone-15-pro', 'airpods-pro']
            },
            // User similarity matrix (simplified)
            userSimilarity: {
                'user1': ['iphone-15-pro', 'airpods-pro', 'smartwatch'],
                'user2': ['samsung-galaxy-s24', 'headphones', 'wireless-charger'],
                'user3': ['macbook-pro', 'airpods-pro', 'camera-canon']
            }
        };
    }

    // Track user behavior
    trackUserBehavior(action, productId, data = {}) {
        const userId = this.getUserId();
        const timestamp = Date.now();

        if (!this.userBehavior[userId]) {
            this.userBehavior[userId] = {
                views: [],
                purchases: [],
                wishlist: [],
                cart: [],
                ratings: []
            };
        }

        switch (action) {
            case 'view':
                this.userBehavior[userId].views.push({
                    productId,
                    timestamp,
                    ...data
                });
                break;
            case 'purchase':
                this.userBehavior[userId].purchases.push({
                    productId,
                    timestamp,
                    quantity: data.quantity || 1,
                    price: data.price
                });
                break;
            case 'wishlist':
                this.userBehavior[userId].wishlist.push({
                    productId,
                    timestamp
                });
                break;
            case 'cart':
                this.userBehavior[userId].cart.push({
                    productId,
                    timestamp
                });
                break;
            case 'rating':
                this.userBehavior[userId].ratings.push({
                    productId,
                    rating: data.rating,
                    timestamp
                });
                break;
        }

        this.saveUserBehavior();
    }

    // Get user ID (simplified)
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    // Collaborative filtering - find similar users
    findSimilarUsers(userId, limit = 3) {
        const currentUser = this.userBehavior[userId];
        if (!currentUser) return [];

        const similarities = [];
        const currentUserProducts = new Set([
            ...currentUser.purchases.map(p => p.productId),
            ...currentUser.wishlist.map(w => w.productId)
        ]);

        Object.keys(this.userBehavior).forEach(otherUserId => {
            if (otherUserId === userId) return;

            const otherUser = this.userBehavior[otherUserId];
            const otherUserProducts = new Set([
                ...otherUser.purchases.map(p => p.productId),
                ...otherUser.wishlist.map(w => w.productId)
            ]);

            // Calculate Jaccard similarity
            const intersection = new Set([...currentUserProducts].filter(x => otherUserProducts.has(x)));
            const union = new Set([...currentUserProducts, ...otherUserProducts]);
            const similarity = intersection.size / union.size;

            if (similarity > 0) {
                similarities.push({
                    userId: otherUserId,
                    similarity,
                    products: Array.from(otherUserProducts)
                });
            }
        });

        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    // Content-based filtering
    getContentBasedRecommendations(productId, limit = 4) {
        const product = this.productData.products.find(p => p.id === productId);
        if (!product) return [];

        const recommendations = this.productData.products
            .filter(p => p.id !== productId)
            .map(p => {
                // Calculate similarity based on tags and category
                const tagSimilarity = this.calculateTagSimilarity(product.tags, p.tags);
                const categorySimilarity = product.category === p.category ? 1 : 0;
                const priceSimilarity = this.calculatePriceSimilarity(product.price, p.price);
                
                const totalSimilarity = (tagSimilarity * 0.5) + (categorySimilarity * 0.3) + (priceSimilarity * 0.2);
                
                return {
                    ...p,
                    similarity: totalSimilarity
                };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

        return recommendations;
    }

    // Calculate tag similarity
    calculateTagSimilarity(tags1, tags2) {
        const set1 = new Set(tags1);
        const set2 = new Set(tags2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }

    // Calculate price similarity
    calculatePriceSimilarity(price1, price2) {
        const diff = Math.abs(price1 - price2);
        const maxPrice = Math.max(price1, price2);
        return Math.max(0, 1 - (diff / maxPrice));
    }

    // Get trending products
    getTrendingProducts(limit = 4) {
        return this.productData.products
            .sort((a, b) => {
                // Sort by views and sales
                const scoreA = (a.views * 0.3) + (a.sales * 0.7);
                const scoreB = (b.views * 0.3) + (b.sales * 0.7);
                return scoreB - scoreA;
            })
            .slice(0, limit);
    }

    // Get frequently bought together
    getFrequentlyBoughtTogether(productId, limit = 3) {
        const frequentlyBought = this.productData.frequentlyBoughtTogether[productId];
        if (!frequentlyBought) return [];

        return frequentlyBought
            .map(id => this.productData.products.find(p => p.id === id))
            .filter(Boolean)
            .slice(0, limit);
    }

    // Get personalized recommendations
    getPersonalizedRecommendations(userId, limit = 4) {
        const user = this.userBehavior[userId];
        if (!user || user.purchases.length === 0) {
            return this.getTrendingProducts(limit);
        }

        // Get user's purchase history
        const purchasedProducts = user.purchases.map(p => p.productId);
        
        // Get recommendations based on purchase history
        const recommendations = [];
        purchasedProducts.forEach(productId => {
            const contentBased = this.getContentBasedRecommendations(productId, 2);
            const frequentlyBought = this.getFrequentlyBoughtTogether(productId, 2);
            
            recommendations.push(...contentBased, ...frequentlyBought);
        });

        // Remove duplicates and already purchased products
        const uniqueRecommendations = recommendations
            .filter((rec, index, self) => 
                index === self.findIndex(r => r.id === rec.id) &&
                !purchasedProducts.includes(rec.id)
            )
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

        return uniqueRecommendations;
    }

    // Generate recommendation HTML
    generateRecommendationHTML(products, title, type = 'default') {
        if (!products || products.length === 0) return '';

        const productsHTML = products.map(product => {
            const salePrice = product.oldPrice ? product.price : product.price;
            const originalPrice = product.oldPrice || product.price;
            const hasSale = product.oldPrice && product.oldPrice > product.price;
            const discount = hasSale ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

            return `
                <div class="col-md-3 col-xs-6">
                    <div class="product enhanced" data-product-id="${product.id}">
                        <div class="product-img">
                            <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/263x328/E4E7ED/333333?text=Product';">
                            <div class="product-label">
                                ${hasSale ? `<span class="sale">-${discount}%</span>` : ''}
                                ${product.rating >= 4.5 ? `<span class="new">HOT</span>` : ''}
                                <span class="recommendation-badge">${type.toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="product-body">
                            <p class="product-category">${this.capitalizeFirst(product.category)}</p>
                            <h3 class="product-name"><a href="./product.html?id=${product.id}">${product.name}</a></h3>
                            <h4 class="product-price">₵${salePrice.toFixed(2)} ${hasSale ? `<del class="product-old-price">₵${originalPrice.toFixed(2)}</del>` : ''}</h4>
                            <div class="product-rating">
                                ${this.generateStars(product.rating)}
                                <span class="review-count">(${product.reviewCount})</span>
                            </div>
                            <div class="product-btns">
                                <button class="add-to-wishlist" onclick="addToWishlist(event, '${product.id}')" aria-label="Add to Wishlist">
                                    <i class="fa fa-heart-o"></i>
                                    <span class="tooltipp">add to wishlist</span>
                                </button>
                                <button class="add-to-compare" onclick="addToCompare(event, '${product.id}')" aria-label="Add to Compare">
                                    <i class="fa fa-exchange"></i>
                                    <span class="tooltipp">add to compare</span>
                                </button>
                                <button class="quick-view" onclick="quickView(event, '${product.id}')" aria-label="Quick View">
                                    <i class="fa fa-eye"></i>
                                    <span class="tooltipp">quick view</span>
                                </button>
                            </div>
                        </div>
                        <div class="add-to-cart">
                            <button class="add-to-cart-btn" onclick="addToCartHandler(event, '${product.id}')">
                                <i class="fa fa-shopping-cart"></i> add to cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="section">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="section-title">
                                <h3 class="title">${title}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        ${productsHTML}
                    </div>
                </div>
            </div>
        `;
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

    // Capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Load recommendations for a specific page
    loadRecommendations(pageType, productId = null) {
        const userId = this.getUserId();
        let recommendations = [];

        switch (pageType) {
            case 'product':
                if (productId) {
                    const contentBased = this.getContentBasedRecommendations(productId, 2);
                    const frequentlyBought = this.getFrequentlyBoughtTogether(productId, 2);
                    recommendations = [...contentBased, ...frequentlyBought];
                }
                break;
            case 'home':
                const trending = this.getTrendingProducts(4);
                const personalized = this.getPersonalizedRecommendations(userId, 4);
                recommendations = [...trending, ...personalized];
                break;
            case 'category':
                const categoryProducts = this.productData.products.filter(p => p.category === productId);
                recommendations = this.getTrendingProducts(4).filter(p => p.category === productId);
                break;
        }

        return recommendations;
    }

    // Initialize recommendation system
    init() {
        // Track page views
        this.trackUserBehavior('view', 'page_view', {
            page: window.location.pathname,
            referrer: document.referrer
        });

        // Load recommendations based on current page
        const currentPage = this.getCurrentPageType();
        const productId = this.getProductIdFromURL();
        
        if (currentPage === 'product' && productId) {
            this.loadProductRecommendations(productId);
        } else if (currentPage === 'home') {
            this.loadHomeRecommendations();
        }
    }

    // Get current page type
    getCurrentPageType() {
        const path = window.location.pathname;
        if (path.includes('product.html')) return 'product';
        if (path.includes('index.html') || path === '/') return 'home';
        if (path.includes('.html')) return 'category';
        return 'home';
    }

    // Get product ID from URL
    getProductIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Load product page recommendations
    loadProductRecommendations(productId) {
        const recommendations = this.loadRecommendations('product', productId);
        const container = document.getElementById('recommendations-container');
        
        if (container && recommendations.length > 0) {
            const html = this.generateRecommendationHTML(
                recommendations.slice(0, 4),
                'You Might Also Like',
                'recommended'
            );
            container.innerHTML = html;
        }
    }

    // Load home page recommendations
    loadHomeRecommendations() {
        const trending = this.getTrendingProducts(4);
        const personalized = this.getPersonalizedRecommendations(this.getUserId(), 4);
        
        // Add trending section
        const trendingContainer = document.getElementById('trending-container');
        if (trendingContainer && trending.length > 0) {
            const trendingHTML = this.generateRecommendationHTML(
                trending,
                'Trending Now',
                'trending'
            );
            trendingContainer.innerHTML = trendingHTML;
        }

        // Add personalized section
        const personalizedContainer = document.getElementById('personalized-container');
        if (personalizedContainer && personalized.length > 0) {
            const personalizedHTML = this.generateRecommendationHTML(
                personalized,
                'Recommended for You',
                'personalized'
            );
            personalizedContainer.innerHTML = personalizedHTML;
        }
    }
}

// Initialize recommendation engine
const recommendationEngine = new RecommendationEngine();

// Track user interactions
document.addEventListener('DOMContentLoaded', function() {
    // Track product views
    const productId = recommendationEngine.getProductIdFromURL();
    if (productId) {
        recommendationEngine.trackUserBehavior('view', productId);
    }

    // Track add to cart
    $(document).on('click', '.add-to-cart-btn', function() {
        const productId = $(this).closest('.product').data('product-id');
        if (productId) {
            recommendationEngine.trackUserBehavior('purchase', productId, {
                quantity: 1,
                price: parseFloat($(this).closest('.product').find('.product-price').text().replace(/[^0-9.-]+/g, ""))
            });
        }
    });

    // Track wishlist additions
    $(document).on('click', '.add-to-wishlist', function() {
        const productId = $(this).closest('.product').data('product-id');
        if (productId) {
            recommendationEngine.trackUserBehavior('wishlist', productId);
        }
    });

    // Initialize recommendations
    recommendationEngine.init();
});

// Export for global access
window.recommendationEngine = recommendationEngine; 