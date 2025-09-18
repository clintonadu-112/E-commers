(function($) {
    "use strict"

    // Mobile Nav toggle
    $('.menu-toggle > a').on('click', function(e) {
        e.preventDefault();
        $('#responsive-nav').toggleClass('active');
    })

    // Fix cart dropdown from closing
    $('.cart-dropdown').on('click', function(e) {
        e.stopPropagation();
    });

    // Fix wishlist dropdown from closing
    $('.wishlist-dropdown').on('click', function(e) {
        e.stopPropagation();
    });

    //=========================================================
    // Cart & Wishlist Functionality
    //=========================================================

    	// Load cart and wishlist from local storage
	let cart = JSON.parse(localStorage.getItem('cart')) || [];
	let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
	
	// Load compare list from local storage
	let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
    
    console.log('Loaded cart from localStorage:', cart);
    console.log('Loaded wishlist from localStorage:', wishlist);
    console.log('localStorage wishlist key:', localStorage.getItem('wishlist'));

    // Save cart to local storage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Save wishlist to local storage
    function saveWishlist() {
        console.log('Saving wishlist to localStorage:', wishlist);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        console.log('localStorage after save:', localStorage.getItem('wishlist'));
    }

    // Update Cart UI
    function updateCart() {
        const cartList = $('.cart-dropdown .cart-list');
        const cartQty = $('.header-ctn .dropdown .qty').eq(1); // Second dropdown is cart
        const cartSummarySmall = $('.cart-dropdown .cart-summary small');
        const cartSummaryTotal = $('.cart-dropdown .cart-summary h5');

        cartList.empty();
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartList.append('<div style="text-align: center; padding: 20px; color: #666;">Your cart is empty</div>');
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                itemCount += item.quantity;
                const productWidget = `
                    <div class="product-widget">
                        <div class="product-img">
                            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/60x60/E4E7ED/333333?text=Product';">
                        </div>
                        <div class="product-body">
                            <h3 class="product-name"><a href="./product.html">${item.name}</a></h3>
                            <h4 class="product-price"><span class="qty">${item.quantity}x</span>$${(item.price * item.quantity).toFixed(2)}</h4>
                        </div>
                        <div class="delete" onclick="removeFromCart('${item.id}')">
                            <i class="fa fa-times"></i>
                        </div>
                    </div>
                `;
                cartList.append(productWidget);
            });
        }

        // Update cart quantity in header
        $('.header-ctn .dropdown .qty').eq(1).text(itemCount);
        cartSummarySmall.text(`${itemCount} Item(s) selected`);
        cartSummaryTotal.text(`SUBTOTAL: $${total.toFixed(2)}`);

        // Also update checkout page if on that page
        if (window.location.pathname.includes('checkout.html')) {
            updateCheckout();
        }
    }

    // Update Wishlist UI
    function updateWishlist() {
        const wishlistCount = wishlist.length;
        $('.header-ctn .dropdown .qty').eq(0).text(wishlistCount);
        
        // Highlight active wishlist icons
        $('.add-to-wishlist').find('.fa').removeClass('fa-heart').addClass('fa-heart-o');
        wishlist.forEach(item => {
            $(`.product[data-product-id="${item.id}"]`).find('.add-to-wishlist .fa').removeClass('fa-heart-o').addClass('fa-heart');
        });

        // Update wishlist dropdown
        const $wishlistList = $('.wishlist-dropdown .wishlist-list');
        const $wishlistSummary = $('.wishlist-dropdown .wishlist-summary');
        
        if (wishlist.length === 0) {
            $wishlistList.html('<div style="text-align: center; padding: 20px; color: #666;">Your wishlist is empty</div>');
            $wishlistSummary.html('<small>0 Item(s) in wishlist</small>');
        } else {
            let wishlistHtml = '';
            wishlist.forEach(item => {
                wishlistHtml += `
                    <div class="product-widget">
                        <div class="product-img">
                            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/60x60/E4E7ED/333333?text=Product';">
                        </div>
                        <div class="product-body">
                            <h3 class="product-name"><a href="./product.html">${item.name}</a></h3>
                            <h4 class="product-price">$${item.price.toFixed(2)}</h4>
                        </div>
                        <div class="delete" onclick="removeFromWishlist('${item.id}')">
                            <i class="fa fa-times"></i>
                        </div>
                    </div>
                `;
            });
            $wishlistList.html(wishlistHtml);
            $wishlistSummary.html(`<small>${wishlist.length} Item(s) in wishlist</small>`);
        }

        // Also update wishlist page if on that page
        if (window.location.pathname.includes('wishlist.html')) {
            // Call the appropriate renderer(s) if present
            if (typeof renderWishlistPage === 'function') {
                renderWishlistPage();
            }
            if (typeof renderWishlistContainer === 'function') {
                renderWishlistContainer();
            }
    }

    // Add to Cart Handler
    $(document).on('click', '.add-to-cart-btn', function(e) {
        e.preventDefault();
        const $btn = $(this);
        const productElem = $btn.closest('.product');
        const productId = productElem.data('product-id');
        const productName = productElem.find('.product-name a').text();
        const productPriceText = productElem.find('.product-price').text();
        const productPrice = parseFloat(productPriceText.replace(/[^0-9.-]+/g, ""));
        const productImage = productElem.find('.product-img img').attr('src');

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        // Visual feedback
        $btn.addClass('added').text('✓ Added to Cart');
        setTimeout(() => {
            $btn.removeClass('added').html('<i class="fa fa-shopping-cart"></i> add to cart');
        }, 2000);
        
        saveCart();
        updateCart();
    });

    // Remove from Cart Handler
    $(document).on('click', '#cart-cta .delete', function() {
        const productId = $(this).data('product-id');
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCart();
    });

    // Remove from Cart
    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCart();
    };

    // Add/Remove from Wishlist Handler
    window.addToWishlist = function(event, productId) {
        event.preventDefault();
        event.stopPropagation();
        
        const productElem = $(event.target).closest('.product');
        const productName = productElem.find('.product-name a').text();
        const productPriceText = productElem.find('.product-price').text();
        const productPrice = parseFloat(productPriceText.replace(/[^0-9.-]+/g, ""));
        const productImage = productElem.find('.product-img img').attr('src');
        
        console.log('Adding/removing from wishlist:', productId);
        console.log('Product name:', productName);
        console.log('Product price:', productPrice);
        console.log('Product image:', productImage);
        
        const itemIndex = wishlist.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            console.log('Removing from wishlist');
            wishlist.splice(itemIndex, 1);
        } else {
            console.log('Adding to wishlist');
            wishlist.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            });
        }
        
        console.log('Wishlist after update:', wishlist);
        saveWishlist();
        updateWishlist();
    };

    // Add/Remove from Compare Handler
    window.addToCompare = function(event, productId) {
        event.preventDefault();
        event.stopPropagation();
        
        const productElem = $(event.target).closest('.product');
        const productName = productElem.find('.product-name a').text();
        const productPriceText = productElem.find('.product-price').text();
        const productPrice = parseFloat(productPriceText.replace(/[^0-9.-]+/g, ""));
        const productImage = productElem.find('.product-img img').attr('src');
        
        // Get or create compare list
        let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
        const itemIndex = compareList.findIndex(item => item.id === productId);
        const $compareBtn = $(event.target).closest('.add-to-compare');
        const $compareIcon = $compareBtn.find('.fa');

        if (itemIndex > -1) {
            // Remove from compare
            compareList.splice(itemIndex, 1);
            $compareIcon.removeClass('fa-exchange').addClass('fa-exchange');
            $compareBtn.find('.tooltipp').text('add to compare');
        } else {
            // Add to compare (limit to 4 items)
            if (compareList.length >= 4) {
                alert('You can compare up to 4 items at a time. Please remove an item from your compare list first.');
                return;
            }
            compareList.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            });
            $compareBtn.find('.tooltipp').text('remove from compare');
        }
        
        localStorage.setItem('compareList', JSON.stringify(compareList));
        updateCompare();
    };

    // Quick View Handler
    window.quickView = function(event, productId) {
        event.preventDefault();
        event.stopPropagation();
        
        const productElem = $(event.target).closest('.product');
        const productName = productElem.find('.product-name a').text();
        const productPriceText = productElem.find('.product-price').text();
        const productPrice = parseFloat(productPriceText.replace(/[^0-9.-]+/g, ""));
        const productImage = productElem.find('.product-img img').attr('src');
        
        // Create quick view modal
        const modalHtml = `
            <div class="quick-view-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                <div class="quick-view-content" style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>Quick View</h3>
                        <button onclick="closeQuickView()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                    </div>
                    <div style="display: flex; gap: 20px;">
                        <div style="flex: 1;">
                            <img src="${productImage}" alt="${productName}" style="width: 100%; height: auto; border-radius: 5px;">
                        </div>
                        <div style="flex: 1;">
                            <h4>${productName}</h4>
                            <p style="color: #D10024; font-size: 18px; font-weight: bold;">${productPriceText}</p>
                            <p style="color: #666; margin: 15px 0;">Product description goes here...</p>
                            <div style="display: flex; gap: 10px; margin-top: 20px;">
                                <button onclick="addToCartFromQuickView('${productId}')" style="background: #D10024; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Add to Cart</button>
                                <button onclick="addToWishlistFromQuickView(event, '${productId}')" style="background: #f8f9fa; color: #6c757d; border: 1px solid #e9ecef; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Add to Wishlist</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHtml);
    };

    // Close Quick View
    window.closeQuickView = function() {
        $('.quick-view-modal').remove();
    };

    // Add to Cart from Quick View
    window.addToCartFromQuickView = function(productId) {
        const productElem = $(`.product[data-product-id="${productId}"]`);
        const productName = productElem.find('.product-name a').text();
        const productPriceText = productElem.find('.product-price').text();
        const productPrice = parseFloat(productPriceText.replace(/[^0-9.-]+/g, ""));
        const productImage = productElem.find('.product-img img').attr('src');

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        saveCart();
        updateCart();
        closeQuickView();
        showNotification('✅ Product added to cart!', 'success');
    };

    // Add to Wishlist from Quick View
    window.addToWishlistFromQuickView = function(event, productId) {
        addToWishlist(event, productId);
        closeQuickView();
    };

    // Remove from Wishlist
    window.removeFromWishlist = function(productId) {
        wishlist = wishlist.filter(item => item.id !== productId);
        saveWishlist();
        updateWishlist();
    };

    // Remove from Cart Dropdown
    window.removeFromDropdown = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCart();
        showNotification('Product removed from cart!', 'success');
    };

    // View Wishlist
    window.viewWishlist = function() {
        window.location.href = './wishlist.html';
    };

    // Add to Cart from Wishlist
    window.addToCartFromWishlist = function(productId) {
        const wishlistItem = wishlist.find(item => item.id === productId);
        if (wishlistItem) {
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id: productId,
                    name: wishlistItem.name,
                    price: wishlistItem.price,
                    image: wishlistItem.image,
                    quantity: 1
                });
            }
            
            saveCart();
            updateCart();
            
            // Show success message with price
            const totalPrice = existingItem ? 
                (existingItem.quantity * existingItem.price) : 
                wishlistItem.price;
            
            // Create a beautiful notification instead of alert
            showNotification(`✅ Added to cart! Total: $${totalPrice.toFixed(2)}`, 'success');
            
            // Update cart total display
            let cartTotal = 0;
            cart.forEach(item => {
                cartTotal += item.price * item.quantity;
            });
            
            console.log('Cart updated - Total items:', cart.length);
            console.log('Cart total value:', cartTotal);
        }
    };

    // Add to Cart Handler (for onclick buttons)
    window.addToCartHandler = function(event, productId) {
        event.preventDefault();
        event.stopPropagation();
        
        const productElem = $(event.target).closest('.product');
        const productName = productElem.find('.product-name a').text();
        const productPriceText = productElem.find('.product-price').text();
        const productPrice = parseFloat(productPriceText.replace(/[^0-9.-]+/g, ""));
        const productImage = productElem.find('.product-img img').attr('src');
        
        console.log('Adding to cart:', productId, productName, productPrice, productImage);
        
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        console.log('Cart after update:', cart);
        saveCart();
        updateCart();
        showNotification('Product added to cart!', 'success');
    };

    // Clear Wishlist Function
    window.clearWishlist = function() {
        if (wishlist.length === 0) {
            showNotification('Your wishlist is already empty!', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear your entire wishlist? This action cannot be undone.')) {
            wishlist = [];
            saveWishlist();
            updateWishlist();
            renderWishlistPage();
            showNotification('Wishlist cleared successfully!', 'success');
        }
    };

    // Show Notification Function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        $('.custom-notification').remove();
        
        const notification = $(`
            <div class="custom-notification ${type}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
            ">
                ${message}
            </div>
        `);
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notification.css('background', 'linear-gradient(135deg, #28a745 0%, #20c997 100%)');
                break;
            case 'error':
                notification.css('background', 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)');
                break;
            case 'warning':
                notification.css('background', 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)');
                break;
            default:
                notification.css('background', 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)');
        }
        
        $('body').append(notification);
        
        // Animate in
        setTimeout(() => {
            notification.css('transform', 'translateX(0)');
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.css('transform', 'translateX(100%)');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }



    // Render Cart Page
    function renderCartPage() {
        console.log('Rendering cart page...');
        console.log('Cart items:', cart);
        
        const cartTable = $('.cart-table tbody');
        const subtotalElement = $('#subtotal');
        const taxElement = $('#tax');
        const grandTotalElement = $('#grand-total');
        
        if (cart.length === 0) {
            console.log('Cart is empty');
            cartTable.html(`
                <tr>
                    <td colspan="5" style="text-align: center; padding: 50px;">
                        <h4>Your cart is empty</h4>
                        <p>Add some products to your cart to see them here.</p>
                        <a href="./categories.html" class="btn btn-primary">Continue Shopping</a>
                    </td>
                </tr>
            `);
            subtotalElement.text('$0.00');
            taxElement.text('$0.00');
            grandTotalElement.text('$0.00');
            return;
        }
        
        let cartHtml = '';
        let subtotal = 0;
        let itemCount = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            itemCount += item.quantity;
            
            cartHtml += `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center;">
                            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; margin-right: 15px; object-fit: cover;" onerror="this.onerror=null;this.src='https://placehold.co/60x60/E4E7ED/333333?text=Product';">
                            <div>
                                <h5 style="margin: 0;">${item.name}</h5>
                                <small style="color: #666;">Product ID: ${item.id}</small>
                            </div>
                        </div>
                    </td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <div style="display: flex; align-items: center;">
                            <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" style="border: none; background: #f8f9fa; padding: 5px 10px; cursor: pointer;">-</button>
                            <span style="margin: 0 15px; font-weight: bold;">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" style="border: none; background: #f8f9fa; padding: 5px 10px; cursor: pointer;">+</button>
                        </div>
                    </td>
                    <td>$${itemTotal.toFixed(2)}</td>
                    <td>
                        <button onclick="removeFromCart('${item.id}')" style="border: none; background: none; color: #D10024; cursor: pointer; font-size: 18px;">×</button>
                    </td>
                </tr>
            `;
        });
        
        cartTable.html(cartHtml);
        
        const tax = subtotal * 0.1; // 10% tax
        const grandTotal = subtotal + tax;
        
        subtotalElement.text(`$${subtotal.toFixed(2)}`);
        taxElement.text(`$${tax.toFixed(2)}`);
        grandTotalElement.text(`$${grandTotal.toFixed(2)}`);
        
        // Update item count in summary
        $('.summary-item:first span:first').text(`Subtotal (${itemCount} items)`);
    }

    // Render Wishlist Page
    function renderWishlistPage() {
        console.log('Rendering wishlist page...');
        console.log('Wishlist items:', wishlist);
        console.log('Wishlist length:', wishlist.length);
        
        const wishlistTable = $('.wishlist-table tbody');
        const wishlistCountElement = $('#wishlist-count');
        const wishlistTotalElement = $('#wishlist-total');
        const wishlistSavedElement = $('#wishlist-saved');
        
        console.log('Found wishlist table:', wishlistTable.length);
        console.log('Found count element:', wishlistCountElement.length);
        console.log('Found total element:', wishlistTotalElement.length);
        
        if (wishlist.length === 0) {
            console.log('Wishlist is empty');
            wishlistTable.html(`
                <tr>
                    <td colspan="4" style="text-align: center; padding: 50px;">
                        <div class="empty-wishlist">
                            <i class="fa fa-heart-o"></i>
                            <h4>Your wishlist is empty</h4>
                            <p>Add some products to your wishlist to see them here.</p>
                            <a href="./categories.html" class="btn-shop-now">Start Shopping</a>
                        </div>
                    </td>
                </tr>
            `);
            wishlistCountElement.text('0');
            wishlistTotalElement.text('$0.00');
            wishlistSavedElement.text('$0.00');
            
            // Update stats cards
            $('#wishlist-count-summary').text('0');
            $('#wishlist-total-summary').text('$0.00');
            $('#wishlist-saved-summary').text('$0.00');
            return;
        }
        
        let wishlistHtml = '';
        let totalValue = 0;
        
        wishlist.forEach((item, index) => {
            totalValue += item.price;
            
            wishlistHtml += `
                <tr class="wishlist-item-new">
                    <td>
                        <div class="wishlist-product">
                            <div class="wishlist-product-img">
                                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/E4E7ED/333333?text=Product';">
                            </div>
                            <div class="wishlist-product-info">
                                <h4>${item.name}</h4>
                                <p>Product ID: ${item.id}</p>
                                <span class="product-category">Wishlist Item</span>
                            </div>
                        </div>
                    </td>
                    <td><strong>$${item.price.toFixed(2)}</strong></td>
                    <td>
                        <button class="btn-add-to-cart-wishlist" onclick="addToCartFromWishlist('${item.id}')" title="Add to Cart">
                            <i class="fa fa-shopping-cart"></i> Add to Cart
                        </button>
                    </td>
                    <td>
                        <button class="btn-remove-wishlist" onclick="removeFromWishlist('${item.id}')" title="Remove from Wishlist">
                            <i class="fa fa-trash"></i> Remove
                        </button>
                    </td>
                </tr>
            `;
        });
        
        wishlistTable.html(wishlistHtml);
        
        // Calculate savings (estimate 10% discount)
        const savings = totalValue * 0.1;
        
        // Update summary
        wishlistCountElement.text(wishlist.length);
        wishlistTotalElement.text(`$${totalValue.toFixed(2)}`);
        wishlistSavedElement.text(`$${savings.toFixed(2)}`);
        
        // Update stats cards
        $('#wishlist-count-summary').text(wishlist.length);
        $('#wishlist-total-summary').text(`$${totalValue.toFixed(2)}`);
        $('#wishlist-saved-summary').text(`$${savings.toFixed(2)}`);
        
        console.log('Wishlist rendered successfully');
        console.log('Total value:', totalValue);
        console.log('Estimated savings:', savings);
    }

    // Update Quantity
    window.updateQuantity = function(productId, newQuantity) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            saveCart();
            updateCart();
            renderCartPage();
        }
    };

    // Update Compare UI
    function updateCompare() {
        const compareList = JSON.parse(localStorage.getItem('compareList')) || [];
        
        // Highlight active compare icons
        $('.add-to-compare').find('.fa').removeClass('fa-exchange').addClass('fa-exchange');
        compareList.forEach(item => {
            $(`.product[data-product-id="${item.id}"]`).find('.add-to-compare .fa').removeClass('fa-exchange').addClass('fa-exchange');
        });
    }

    // Initialize all functionality on page load
    $(document).ready(function() {
        updateCart();
        updateWishlist();
        updateCompare();
        
        // Render cart page if on cart page
        if (window.location.pathname.includes('cart.html')) {
            renderCartPage();
        }
        
        // Render wishlist page if on wishlist page
        if (window.location.pathname.includes('wishlist.html')) {
            renderWishlistPage();
        }
    });

    // Render Wishlist Grid Container (avoid name collision with table-based renderer above)
    function renderWishlistContainer() {
        const wishlistContainer = $('#wishlist-container');
        if (!wishlistContainer.length) return;

        wishlistContainer.empty();
        if (wishlist.length === 0) {
            wishlistContainer.html('<div class="col-md-12 text-center"><h3>Your wishlist is empty.</h3></div>');
            return;
        }

        wishlist.forEach(item => {
            const productHtml = `
                <div class="col-md-4 col-sm-6">
                    <div class="product" data-product-id="${item.id}">
                        <div class="product-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="product-body">
                            <p class="product-category">Wishlist</p>
                            <h3 class="product-name"><a href="#">${item.name}</a></h3>
                            <h4 class="product-price">$${item.price.toFixed(2)}</h4>
                            <div class="product-btns">
                                <button class="add-to-wishlist" onclick="addToWishlist(event, '${item.id}')" aria-label="Remove from Wishlist"><i class="fa fa-heart"></i><span class="tooltipp">remove from wishlist</span></button>
                            </div>
                        </div>
                        <div class="add-to-cart">
                            <button class="add-to-cart-btn"><i class="fa fa-shopping-cart"></i> add to cart</button>
                        </div>
                    </div>
                </div>
            `;
            wishlistContainer.append(productHtml);
        });
    }

    // Update Checkout Page
	function updateCheckout() {
		const orderProducts = $('.order-products');
		const orderTotal = $('.order-total');
		let total = 0;

		if (orderProducts.length) {
			orderProducts.empty();
			if (cart.length > 0) {
				cart.forEach(item => {
					total += item.price * item.quantity;
					const orderCol = `
						<div class="order-col">
							<div>${item.quantity}x ${item.name}</div>
							<div>$${(item.price * item.quantity).toFixed(2)}</div>
						</div>
					`;
					orderProducts.append(orderCol);
				});
			}
			$('.order-col .order-total').text(`$${total.toFixed(2)}`);
		}
	}

    // Initialize on page load
    $(document).ready(function() {
        updateCart();
        updateWishlist();
        if (window.location.pathname.includes('wishlist.html')) {
            renderWishlistPage();
        }
        if (window.location.pathname.includes('checkout.html')) {
            updateCheckout();
        }
    });


    /////////////////////////////////////////
    // Slick Carousel and other plugins
    /////////////////////////////////////////

    // Products Slick
    $('.products-slick').each(function() {
        var $this = $(this),
            $nav = $this.attr('data-nav');

        // Guard: avoid double-initialize
        if ($this.hasClass('slick-initialized')) return;

        $this.slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            autoplay: true,
            infinite: true,
            speed: 300,
            dots: false,
            arrows: true,
            appendArrows: $nav ? $nav : false,
            responsive: [{
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                },
            ]
        });
    });

    // Products Widget Slick
    $('.products-widget-slick').each(function() {
        var $this = $(this),
            $nav = $this.attr('data-nav');

        $this.slick({
            infinite: true,
            autoplay: true,
            speed: 300,
            dots: false,
            arrows: true,
            appendArrows: $nav ? $nav : false,
        });
    });

    // Product Main img Slick
    $('#product-main-img').slick({
        infinite: true,
        speed: 300,
        dots: false,
        arrows: true,
        fade: true,
        asNavFor: '#product-imgs',
    });

    // Product imgs Slick
    $('#product-imgs').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        centerMode: true,
        focusOnSelect: true,
        centerPadding: 0,
        vertical: true,
        asNavFor: '#product-main-img',
        responsive: [{
            breakpoint: 991,
            settings: {
                vertical: false,
                arrows: false,
                dots: true,
            }
        }, ]
    });

    // Product img zoom
    var zoomMainProduct = document.getElementById('product-main-img');
    if (zoomMainProduct) {
        $('#product-main-img .product-preview').zoom();
    }

    // Input number
    $('.input-number').each(function() {
        var $this = $(this),
            $input = $this.find('input[type="number"]'),
            up = $this.find('.qty-up'),
            down = $this.find('.qty-down');

        down.on('click', function() {
            var value = parseInt($input.val()) - 1;
            value = value < 1 ? 1 : value;
            $input.val(value);
            $input.change();
            updatePriceSlider($this, value)
        })

        up.on('click', function() {
            var value = parseInt($input.val()) + 1;
            $input.val(value);
            $input.change();
            updatePriceSlider($this, value)
        }) 
    });

    var priceInputMax = document.getElementById('price-max'),
        priceInputMin = document.getElementById('price-min');
    if (priceInputMax && priceInputMin) {
        priceInputMax.addEventListener('change', function() {
            updatePriceSlider($(this).parent(), this.value)
        });

        priceInputMin.addEventListener('change', function() {
            updatePriceSlider($(this).parent(), this.value)
        });
    }

    function updatePriceSlider(elem, value) {
        if (elem.hasClass('price-min')) {
            priceSlider.noUiSlider.set([value, null]);
        } else if (elem.hasClass('price-max')) {
            priceSlider.noUiSlider.set([null, value]);
        }
    }

    // Price Slider
    var priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        noUiSlider.create(priceSlider, {
            start: [1, 999],
            connect: true,
            step: 1,
            range: {
                'min': 1,
                'max': 999
            }
        });

        priceSlider.noUiSlider.on('update', function(values, handle) {
            var value = values[handle];
            handle ? priceInputMax.value = value : priceInputMin.value = value
        });
    }
    
    // Product card animations and interactions
    function initProductCards() {
        // Add loading animation to product cards
        $('.product').each(function(index) {
            $(this).css('animation-delay', (index * 0.1) + 's');
        });
        
        // Add hover effects for product images
        $('.product').on('mouseenter', function() {
            $(this).find('.product-img img').addClass('zoomed');
        }).on('mouseleave', function() {
            $(this).find('.product-img img').removeClass('zoomed');
        });
        
        // Add click ripple effect to add to cart buttons
        $('.add-to-cart-btn').on('click', function(e) {
            var $this = $(this);
            var ripple = $('<span class="ripple"></span>');
            var rect = this.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            var x = e.clientX - rect.left - size / 2;
            var y = e.clientY - rect.top - size / 2;
            
            ripple.css({
                width: size,
                height: size,
                left: x + 'px',
                top: y + 'px'
            });
            
            $this.append(ripple);
            
            setTimeout(function() {
                ripple.remove();
            }, 600);
        });
        
        // Add smooth scroll to product details
        $('.product-name a').on('click', function(e) {
            e.preventDefault();
            var href = $(this).attr('href');
            
            // Add page transition effect
            $('body').addClass('page-transition');
            
            setTimeout(function() {
                window.location.href = href;
            }, 300);
        });
    }
    
    // Initialize product cards when document is ready
    $(document).ready(function() {
        initProductCards();
    });

})(jQuery);
