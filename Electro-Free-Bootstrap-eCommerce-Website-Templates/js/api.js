// API Integration for Electro eCommerce
const API_BASE_URL = 'http://localhost:8000/backend/api';

class ElectroAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Generic API call method
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}/${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Products API
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`products.php?${queryString}`);
    }

    async getProductById(productId) {
        return this.apiCall(`products.php?id=${productId}`);
    }

    async searchProducts(query, filters = {}) {
        const params = { search: query, ...filters };
        return this.apiCall(`products.php?${new URLSearchParams(params).toString()}`);
    }

    // Orders API
    async createOrder(orderData) {
        return this.apiCall('orders.php', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders(userId = null) {
        const params = userId ? { user_id: userId } : {};
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`orders.php?${queryString}`);
    }

    async getOrderById(orderId) {
        return this.apiCall(`orders.php?order_id=${orderId}`);
    }

    // Reviews API
    async getProductReviews(productId, params = {}) {
        const queryParams = { product_id: productId, ...params };
        const queryString = new URLSearchParams(queryParams).toString();
        return this.apiCall(`reviews.php?${queryString}`);
    }

    async submitReview(reviewData) {
        return this.apiCall('reviews.php', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    // Payment API
    async processPayment(paymentData) {
        return this.apiCall('payment.php', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // Cart Management (using localStorage for now, can be moved to backend)
    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    addToCart(product) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.image_url || product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartUI();
        return cart;
    }

    removeFromCart(productId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        this.updateCartUI();
        return updatedCart;
    }

    updateCartQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                this.updateCartUI();
                return cart;
            }
        }
        return cart;
    }

    clearCart() {
        localStorage.removeItem('cart');
        this.updateCartUI();
    }

    updateCartUI() {
        const cart = this.getCart();
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Update cart count in header
        $('.header-ctn .dropdown .qty').eq(1).text(cartCount);

        // Update cart dropdown
        const cartList = $('.cart-dropdown .cart-list');
        cartList.empty();

        if (cart.length === 0) {
            cartList.append('<div style="text-align: center; padding: 20px; color: #666;">Your cart is empty</div>');
        } else {
            cart.forEach(item => {
                const cartItem = `
                    <div class="product-widget">
                        <div class="product-img">
                            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/60x60/E4E7ED/333333?text=Product';">
                        </div>
                        <div class="product-body">
                            <h3 class="product-name"><a href="./product.html?id=${item.id}">${item.name}</a></h3>
                            <h4 class="product-price"><span class="qty">${item.quantity}x</span>GHS {(item.price * item.quantity).toFixed(2)}</h4>
                        </div>
                        <div class="delete" onclick="electroAPI.removeFromCart('${item.id}')">
                            <i class="fa fa-times"></i>
                        </div>
                    </div>
                `;
                cartList.append(cartItem);
            });
        }

        // Update cart summary
        $('.cart-dropdown .cart-summary small').text(`${cartCount} Item(s) selected`);
        $('.cart-dropdown .cart-summary h5').text(`SUBTOTAL: GHS ${cartTotal.toFixed(2)}`);
    }

    // Wishlist Management
    getWishlist() {
        return JSON.parse(localStorage.getItem('wishlist')) || [];
    }

    addToWishlist(product) {
        const wishlist = this.getWishlist();
        if (!wishlist.find(item => item.id === product.id)) {
            wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.image_url || product.image
            });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            this.updateWishlistUI();
        }
        return wishlist;
    }

    removeFromWishlist(productId) {
        const wishlist = this.getWishlist();
        const updatedWishlist = wishlist.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        this.updateWishlistUI();
        return updatedWishlist;
    }

    updateWishlistUI() {
        const wishlist = this.getWishlist();
        const wishlistCount = wishlist.length;

        // Update wishlist count in header
        $('.header-ctn .dropdown .qty').eq(0).text(wishlistCount);

        // Update wishlist dropdown
        const wishlistList = $('.wishlist-dropdown .wishlist-list');
        wishlistList.empty();

        if (wishlist.length === 0) {
            wishlistList.append('<div style="text-align: center; padding: 20px; color: #666;">Your wishlist is empty</div>');
        } else {
            wishlist.forEach(item => {
                const wishlistItem = `
                    <div class="product-widget">
                        <div class="product-img">
                            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/60x60/E4E7ED/333333?text=Product';">
                        </div>
                        <div class="product-body">
                            <h3 class="product-name"><a href="./product.html?id=${item.id}">${item.name}</a></h3>
                            <h4 class="product-price">GHS {item.price.toFixed(2)}</h4>
                        </div>
                        <div class="delete" onclick="electroAPI.removeFromWishlist('${item.id}')">
                            <i class="fa fa-times"></i>
                        </div>
                    </div>
                `;
                wishlistList.append(wishlistItem);
            });
        }

        // Update wishlist summary
        $('.wishlist-dropdown .wishlist-summary small').text(`${wishlistCount} Item(s) in wishlist`);
    }

    // Product Display Functions
    async loadProducts(container, params = {}) {
        try {
            const response = await this.getProducts(params);
            const products = response.data;

            container.empty();
            products.forEach(product => {
                const productHtml = this.createProductHTML(product);
                container.append(productHtml);
            });

            return products;
        } catch (error) {
            console.error('Error loading products:', error);
            container.html('<div class="text-center"><p>Error loading products. Please try again.</p></div>');
        }
    }

    createProductHTML(product) {
        const salePrice = product.sale_price || product.price;
        const originalPrice = product.price;
        const hasSale = product.sale_price && product.sale_price < product.price;
        
        const rating = product.avg_rating || 0;
        const reviewCount = product.review_count || 0;
        
        const stars = this.generateStars(rating);
        const saleBadge = hasSale ? `<span class="sale">-${Math.round(((originalPrice - salePrice) / originalPrice) * 100)}%</span>` : '';
        const newBadge = product.featured ? `<span class="new">NEW</span>` : '';

        return `
            <div class="col-md-3 col-xs-6">
                <div class="product" data-product-id="${product.id}">
                    <div class="product-img">
                        <img src="${product.images?.[0]?.image_url || './img/product01.png'}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/263x328/E4E7ED/333333?text=Product';">
                        <div class="product-label">
                            ${saleBadge}
                            ${newBadge}
                        </div>
                    </div>
                    <div class="product-body">
                        <p class="product-category">${product.category_name || 'Category'}</p>
                        <h3 class="product-name"><a href="./product.html?id=${product.id}">${product.name}</a></h3>
                        <h4 class="product-price">
                            GHS ${salePrice.toFixed(2)}
                            ${hasSale ? `<del class="product-old-price">GHS ${originalPrice.toFixed(2)}</del>` : ''}
                        </h4>
                        <div class="product-rating">
                            ${stars}
                            <span class="review-count">(${reviewCount})</span>
                        </div>
                        <div class="product-btns">
                            <button class="add-to-wishlist" onclick="electroAPI.addToWishlist(${JSON.stringify(product).replace(/"/g, '&quot;')})" aria-label="Add to Wishlist">
                                <i class="fa fa-heart-o"></i>
                                <span class="tooltipp">add to wishlist</span>
                            </button>
                            <button class="add-to-compare" aria-label="Add to Compare">
                                <i class="fa fa-exchange"></i>
                                <span class="tooltipp">add to compare</span>
                            </button>
                            <button class="quick-view" aria-label="Quick View">
                                <i class="fa fa-eye"></i>
                                <span class="tooltipp">quick view</span>
                            </button>
                        </div>
                    </div>
                    <div class="add-to-cart">
                        <button class="add-to-cart-btn" onclick="electroAPI.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            <i class="fa fa-shopping-cart"></i> add to cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fa fa-star${i <= rating ? '' : '-o'}"></i>`;
        }
        return stars;
    }

    // Checkout Functions
    async processCheckout(checkoutData) {
        try {
            // Create order
            const orderResponse = await this.createOrder(checkoutData);
            
            // Process payment
            const paymentData = {
                payment_method: checkoutData.payment_method,
                amount: orderResponse.total_amount,
                currency: 'USD',
                order_id: orderResponse.order_id,
                ...checkoutData.payment_details
            };

            const paymentResponse = await this.processPayment(paymentData);
            
            // Clear cart after successful order
            this.clearCart();
            
            return {
                order: orderResponse,
                payment: paymentResponse
            };
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    }

    // Search Functions
    async performSearch(query, filters = {}) {
        try {
            const response = await this.searchProducts(query, filters);
            return response.data;
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = `
            <div class="notification ${type}">
                <div class="notification-header">
                    <h4 class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                </div>
                <p class="notification-message">${message}</p>
            </div>
        `;
        
        $('#notification-center').append(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            $('.notification').last().fadeOut(() => {
                $('.notification').last().remove();
            });
        }, 5000);
    }
}

// Initialize API
const electroAPI = new ElectroAPI();

// Global functions for backward compatibility
function addToCartHandler(event, productId) {
    event.preventDefault();
    // This would need to be updated to work with the new API
    // For now, we'll use the existing localStorage approach
    const product = {
        id: productId,
        name: 'Product Name',
        price: 99.99,
        image: './img/product01.png'
    };
    electroAPI.addToCart(product);
    electroAPI.showNotification('Product added to cart!', 'success');
}

function addToWishlist(event, productId) {
    event.preventDefault();
    const product = {
        id: productId,
        name: 'Product Name',
        price: 99.99,
        image: './img/product01.png'
    };
    electroAPI.addToWishlist(product);
    electroAPI.showNotification('Product added to wishlist!', 'success');
}

// Initialize cart and wishlist UI on page load
$(document).ready(function() {
    electroAPI.updateCartUI();
    electroAPI.updateWishlistUI();
}); 