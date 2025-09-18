// Currency Management System
class CurrencyManager {
    constructor() {
        this.currentCurrency = localStorage.getItem('selectedCurrency') || 'GHS';
        this.exchangeRates = {
            'GHS': 1.0,
            'USD': 0.083, // 1 GHS = 0.083 USD (approximate)
            'EUR': 0.076, // 1 GHS = 0.076 EUR (approximate)
            'GBP': 0.065, // 1 GHS = 0.065 GBP (approximate)
            'NGN': 75.0,  // 1 GHS = 75 NGN (approximate)
            'KES': 12.5,  // 1 GHS = 12.5 KES (approximate)
            'ZAR': 1.55,  // 1 GHS = 1.55 ZAR (approximate)
            'EGP': 2.55,  // 1 GHS = 2.55 EGP (approximate)
            'MAD': 0.83,  // 1 GHS = 0.83 MAD (approximate)
            'TND': 0.26   // 1 GHS = 0.26 TND (approximate)
        };
        
        this.currencySymbols = {
            'GHS': '₵',
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'NGN': '₦',
            'KES': 'KSh',
            'ZAR': 'R',
            'EGP': 'E£',
            'MAD': 'MAD',
            'TND': 'TND'
        };
        
        this.init();
    }
    
    init() {
        this.updateCurrencyDisplay();
        this.updateAllPrices();
        this.setupCurrencySelector();
    }
    
    convertPrice(priceInGHS, targetCurrency) {
        if (targetCurrency === 'GHS') {
            return priceInGHS;
        }
        return priceInGHS * this.exchangeRates[targetCurrency];
    }
    
    formatPrice(price, currency) {
        const symbol = this.currencySymbols[currency];
        if (currency === 'GHS' || currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
            return `${symbol}${price.toFixed(2)}`;
        } else {
            return `${symbol}${Math.round(price)}`;
        }
    }
    
    updateCurrencyDisplay() {
        const currencyElements = document.querySelectorAll('.currency-display');
        currencyElements.forEach(element => {
            element.innerHTML = `<i class="fa fa-money"></i> ${this.currentCurrency}`;
        });
    }
    
    updateAllPrices() {
        // Update all product prices
        const priceElements = document.querySelectorAll('.product-price, .product-old-price');
        priceElements.forEach(element => {
            const originalPrice = this.extractOriginalPrice(element);
            if (originalPrice) {
                const convertedPrice = this.convertPrice(originalPrice, this.currentCurrency);
                const formattedPrice = this.formatPrice(convertedPrice, this.currentCurrency);
                element.textContent = formattedPrice;
            }
        });
        
        // Update cart subtotal
        this.updateCartSubtotal();
    }
    
    extractOriginalPrice(element) {
        // Extract the original GHS price from data attribute or text
        const dataPrice = element.getAttribute('data-original-price');
        if (dataPrice) {
            return parseFloat(dataPrice);
        }
        
        // Try to extract from text content (fallback)
        const text = element.textContent;
        const match = text.match(/[\d,]+\.?\d*/);
        if (match) {
            return parseFloat(match[0].replace(',', ''));
        }
        
        return null;
    }
    
    updateCartSubtotal() {
        const subtotalElements = document.querySelectorAll('.cart-summary h5');
        subtotalElements.forEach(element => {
            if (element.textContent.includes('SUBTOTAL')) {
                const currentSubtotal = this.getCurrentCartSubtotal();
                const convertedSubtotal = this.convertPrice(currentSubtotal, this.currentCurrency);
                const formattedSubtotal = this.formatPrice(convertedSubtotal, this.currentCurrency);
                element.textContent = `SUBTOTAL: ${formattedSubtotal}`;
            }
        });
    }
    
    getCurrentCartSubtotal() {
        // This would typically get the actual cart total from localStorage or session
        // For now, return 0 as placeholder
        return 0;
    }
    
    setupCurrencySelector() {
        const currencyDropdown = document.querySelector('.currency-dropdown');
        if (currencyDropdown) {
            // Set the selected option based on stored currency
            currencyDropdown.value = this.currentCurrency;
            
            currencyDropdown.addEventListener('change', (e) => {
                this.currentCurrency = e.target.value;
                localStorage.setItem('selectedCurrency', this.currentCurrency);
                this.updateCurrencyDisplay();
                this.updateAllPrices();
            });
        }
    }
    
    setOriginalPrices() {
        // Set data attributes for original prices (in GHS)
        const priceElements = document.querySelectorAll('.product-price, .product-old-price');
        priceElements.forEach(element => {
            const text = element.textContent;
            const match = text.match(/[\d,]+\.?\d*/);
            if (match && !element.hasAttribute('data-original-price')) {
                const price = parseFloat(match[0].replace(',', ''));
                element.setAttribute('data-original-price', price);
            }
        });
    }
}

// Initialize currency manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.currencyManager = new CurrencyManager();
    window.currencyManager.setOriginalPrices();
});

// Function to change currency (can be called from HTML)
function changeCurrency(currency) {
    if (window.currencyManager) {
        window.currencyManager.currentCurrency = currency;
        localStorage.setItem('selectedCurrency', currency);
        window.currencyManager.updateCurrencyDisplay();
        window.currencyManager.updateAllPrices();
    }
} 