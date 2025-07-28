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

    //=========================================================
    // Cart & Wishlist Functionality
    //=========================================================

    // Load cart and wishlist from local storage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Save cart to local storage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Save wishlist to local storage
    function saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    // Update Cart UI
    function updateCart() {
        const cartList = $('#cart-cta .cart-list');
        const cartQty = $('#cart-cta .qty');
        const cartSummarySmall = $('#cart-cta .cart-summary small');
        const cartSummaryTotal = $('#cart-cta .cart-summary h5');

        cartList.empty();
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartList.append('<p style="padding: 15px; text-align: center;">Your cart is empty.</p>');
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                itemCount += item.quantity;
                const productWidget = `
                    <div class="product-widget">
                        <div class="product-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="product-body">
                            <h3 class="product-name"><a href="#">${item.name}</a></h3>
                            <h4 class="product-price"><span class="qty">${item.quantity}x</span>$${(item.price * item.quantity).toFixed(2)}</h4>
                        </div>
                        <button class="delete" data-product-id="${item.id}"><i class="fa fa-close"></i></button>
                    </div>
                `;
                cartList.append(productWidget);
            });
        }

        cartQty.text(itemCount);
        cartSummarySmall.text(`${itemCount} Item(s) selected`);
        cartSummaryTotal.text(`SUBTOTAL: $${total.toFixed(2)}`);

        // Also update checkout page if on that page
        if (window.location.pathname.includes('checkout.html')) {
            updateCheckout();
        }
    }

    // Update Wishlist UI
    function updateWishlist() {
        const wishlistQty = $('#wishlist-cta .qty');
        wishlistQty.text(wishlist.length);
        
        // Highlight active wishlist icons
        $('.add-to-wishlist').find('.fa').removeClass('fa-heart').addClass('fa-heart-o');
        wishlist.forEach(item => {
            $(`.product[data-product-id="${item.id}"]`).find('.add-to-wishlist .fa').removeClass('fa-heart-o').addClass('fa-heart');
        });

        // Also update wishlist page if on that page
        if (window.location.pathname.includes('wishlist.html')) {
            renderWishlistPage();
        }
    }

    // Add to Cart Handler
    $(document).on('click', '.add-to-cart-btn', function(e) {
        e.preventDefault();
        const productElem = $(this).closest('.product');
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

    // Add/Remove from Wishlist Handler
    window.addToWishlist = function(event, productId) {
        event.preventDefault();
        event.stopPropagation();
        
        const productElem = $(event.target).closest('.product');
        const productName = productElem.find('.product-name a').text();
        const productPriceText = productElem.find('.product-price').text();
        const productPrice = parseFloat(productPriceText.replace(/[^0-9.-]+/g, ""));
        const productImage = productElem.find('.product-img img').attr('src');
        
        const itemIndex = wishlist.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            wishlist.splice(itemIndex, 1);
        } else {
            wishlist.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            });
        }
        saveWishlist();
        updateWishlist();
    };

    // Render Wishlist Page
    function renderWishlistPage() {
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
