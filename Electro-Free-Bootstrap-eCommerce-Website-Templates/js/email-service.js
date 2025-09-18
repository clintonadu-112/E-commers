// Electro eCommerce - Email Service Integration
// Handles email functionality for order confirmations, password resets, and newsletters

class EmailService {
    constructor() {
        this.emailTemplates = this.loadEmailTemplates();
        this.subscribers = this.loadSubscribers();
        this.init();
    }

    // Load email templates
    loadEmailTemplates() {
        return {
            orderConfirmation: {
                subject: 'Order Confirmation - Electro',
                template: (orderData) => `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">Electro</h1>
                            <p style="margin: 10px 0 0 0;">Your Order Confirmation</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #2C3E50; margin-bottom: 20px;">Thank you for your order!</h2>
                            
                            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <h3 style="color: #D10024; margin-bottom: 15px;">Order Details</h3>
                                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                                <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
                                <p><strong>Total Amount:</strong> ₵${orderData.total.toFixed(2)}</p>
                            </div>
                            
                            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <h3 style="color: #D10024; margin-bottom: 15px;">Items Ordered</h3>
                                ${orderData.items.map(item => `
                                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                        <div>
                                            <strong>${item.name}</strong><br>
                                            <small>Qty: ${item.quantity}</small>
                                        </div>
                                        <div>₵${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <h3 style="color: #D10024; margin-bottom: 15px;">Shipping Address</h3>
                                <p>${orderData.shippingAddress}</p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="./my-account.html" style="background: #D10024; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Order</a>
                            </div>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
                                <p>If you have any questions, please contact us at support@electro.com</p>
                                <p>&copy; 2024 Electro. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `
            },
            
            passwordReset: {
                subject: 'Password Reset Request - Electro',
                template: (userData) => `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">Electro</h1>
                            <p style="margin: 10px 0 0 0;">Password Reset Request</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #2C3E50; margin-bottom: 20px;">Hello ${userData.name},</h2>
                            
                            <p>We received a request to reset your password for your Electro account.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                <h3 style="color: #D10024; margin-bottom: 15px;">Reset Your Password</h3>
                                <a href="./reset-password.html?token=${userData.resetToken}" style="background: #D10024; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
                                <p style="margin-top: 15px; font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
                            </div>
                            
                            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
                                <p>For security reasons, this link will expire in 24 hours.</p>
                                <p>&copy; 2024 Electro. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `
            },
            
            newsletter: {
                subject: 'Electro Newsletter - Latest Updates',
                template: (newsletterData) => `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">Electro</h1>
                            <p style="margin: 10px 0 0 0;">Latest Updates & Offers</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #2C3E50; margin-bottom: 20px;">${newsletterData.title}</h2>
                            
                            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                <p>${newsletterData.content}</p>
                            </div>
                            
                            ${newsletterData.featuredProducts ? `
                                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                    <h3 style="color: #D10024; margin-bottom: 15px;">Featured Products</h3>
                                    ${newsletterData.featuredProducts.map(product => `
                                        <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                                            <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 15px;">
                                            <div>
                                                <strong>${product.name}</strong><br>
                                                <span style="color: #D10024; font-weight: bold;">₵${product.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="./index.html" style="background: #D10024; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Shop Now</a>
                            </div>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
                                <p><a href="./unsubscribe.html?email=${newsletterData.email}" style="color: #666;">Unsubscribe</a> | <a href="./preferences.html" style="color: #666;">Email Preferences</a></p>
                                <p>&copy; 2024 Electro. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `
            },
            
            welcomeEmail: {
                subject: 'Welcome to Electro!',
                template: (userData) => `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">Electro</h1>
                            <p style="margin: 10px 0 0 0;">Welcome to the Family!</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #2C3E50; margin-bottom: 20px;">Welcome, ${userData.name}!</h2>
                            
                            <p>Thank you for joining Electro! We're excited to have you as part of our community.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #D10024; margin-bottom: 15px;">Get Started</h3>
                                <ul style="list-style: none; padding: 0;">
                                    <li style="padding: 8px 0;">✅ Browse our latest products</li>
                                    <li style="padding: 8px 0;">✅ Create your wishlist</li>
                                    <li style="padding: 8px 0;">✅ Get exclusive offers</li>
                                    <li style="padding: 8px 0;">✅ Track your orders</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="./index.html" style="background: #D10024; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">Start Shopping</a>
                                <a href="./profile.html" style="background: #6C757D; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">My Account</a>
                            </div>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
                                <p>Need help? Contact us at support@electro.com</p>
                                <p>&copy; 2024 Electro. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `
            }
        };
    }

    // Load subscribers from localStorage
    loadSubscribers() {
        const subscribers = localStorage.getItem('emailSubscribers');
        return subscribers ? JSON.parse(subscribers) : [];
    }

    // Save subscribers to localStorage
    saveSubscribers() {
        localStorage.setItem('emailSubscribers', JSON.stringify(this.subscribers));
    }

    // Initialize email service
    init() {
        this.bindEvents();
    }

    // Bind events
    bindEvents() {
        // Newsletter subscription
        $(document).on('submit', '#newsletter-form', (e) => {
            e.preventDefault();
            this.subscribeToNewsletter();
        });

        // Password reset
        $(document).on('submit', '#password-reset-form', (e) => {
            e.preventDefault();
            this.sendPasswordReset();
        });
    }

    // Send order confirmation email
    sendOrderConfirmation(orderData) {
        const template = this.emailTemplates.orderConfirmation;
        const emailContent = template.template(orderData);
        
        // Simulate email sending
        this.simulateEmailSending({
            to: orderData.customerEmail,
            subject: template.subject,
            content: emailContent,
            type: 'order_confirmation'
        });

        return {
            success: true,
            message: 'Order confirmation email sent successfully!'
        };
    }

    // Send password reset email
    sendPasswordResetEmail(userEmail) {
        const userData = {
            name: this.getUserName(userEmail),
            resetToken: this.generateResetToken(),
            email: userEmail
        };

        const template = this.emailTemplates.passwordReset;
        const emailContent = template.template(userData);
        
        // Simulate email sending
        this.simulateEmailSending({
            to: userEmail,
            subject: template.subject,
            content: emailContent,
            type: 'password_reset'
        });

        return {
            success: true,
            message: 'Password reset email sent successfully!',
            resetToken: userData.resetToken
        };
    }

    // Send welcome email
    sendWelcomeEmail(userData) {
        const template = this.emailTemplates.welcomeEmail;
        const emailContent = template.template(userData);
        
        // Simulate email sending
        this.simulateEmailSending({
            to: userData.email,
            subject: template.subject,
            content: emailContent,
            type: 'welcome'
        });

        return {
            success: true,
            message: 'Welcome email sent successfully!'
        };
    }

    // Subscribe to newsletter
    subscribeToNewsletter() {
        const email = $('#newsletter-email').val().trim();
        
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (this.subscribers.includes(email)) {
            this.showNotification('You are already subscribed to our newsletter!', 'info');
            return;
        }

        this.subscribers.push(email);
        this.saveSubscribers();

        // Send welcome newsletter
        this.sendNewsletter({
            email: email,
            title: 'Welcome to Electro Newsletter!',
            content: 'Thank you for subscribing to our newsletter. You\'ll receive the latest updates, exclusive offers, and product recommendations.',
            featuredProducts: this.getFeaturedProducts()
        });

        this.showNotification('Successfully subscribed to newsletter!', 'success');
        $('#newsletter-email').val('');
    }

    // Send newsletter
    sendNewsletter(newsletterData) {
        const template = this.emailTemplates.newsletter;
        const emailContent = template.template(newsletterData);
        
        // Simulate email sending
        this.simulateEmailSending({
            to: newsletterData.email,
            subject: template.subject,
            content: emailContent,
            type: 'newsletter'
        });

        return {
            success: true,
            message: 'Newsletter sent successfully!'
        };
    }

    // Send password reset
    sendPasswordReset() {
        const email = $('#reset-email').val().trim();
        
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        const result = this.sendPasswordResetEmail(email);
        
        if (result.success) {
            this.showNotification('Password reset email sent! Check your inbox.', 'success');
            $('#reset-email').val('');
        } else {
            this.showNotification('Failed to send password reset email', 'error');
        }
    }

    // Simulate email sending
    simulateEmailSending(emailData) {
        console.log('📧 Email Service - Simulating email send:', {
            to: emailData.to,
            subject: emailData.subject,
            type: emailData.type,
            timestamp: new Date().toISOString()
        });

        // Store email in localStorage for demo purposes
        const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        sentEmails.push({
            ...emailData,
            sentAt: new Date().toISOString(),
            id: Date.now()
        });
        localStorage.setItem('sentEmails', JSON.stringify(sentEmails));

        // Simulate delay
        setTimeout(() => {
            console.log('✅ Email sent successfully to:', emailData.to);
        }, 1000);
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Get user name from email
    getUserName(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        return user ? `${user.firstName} ${user.lastName}` : 'User';
    }

    // Generate reset token
    generateResetToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // Get featured products for newsletter
    getFeaturedProducts() {
        return [
            {
                name: 'iPhone 15 Pro',
                price: 999.00,
                image: './img/iphone-15-pro.jpg'
            },
            {
                name: 'MacBook Pro 16"',
                price: 2499.00,
                image: './img/macbook-pro.jpg'
            },
            {
                name: 'AirPods Pro',
                price: 249.00,
                image: './img/airpods-pro.jpg'
            }
        ];
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
        }, 5000);
    }

    // Get email statistics
    getEmailStats() {
        const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        const subscribers = this.subscribers;
        
        const stats = {
            totalEmailsSent: sentEmails.length,
            totalSubscribers: subscribers.length,
            emailsByType: {},
            recentEmails: sentEmails.slice(-10).reverse()
        };

        // Count emails by type
        sentEmails.forEach(email => {
            stats.emailsByType[email.type] = (stats.emailsByType[email.type] || 0) + 1;
        });

        return stats;
    }

    // Unsubscribe from newsletter
    unsubscribeFromNewsletter(email) {
        const index = this.subscribers.indexOf(email);
        if (index > -1) {
            this.subscribers.splice(index, 1);
            this.saveSubscribers();
            return true;
        }
        return false;
    }
}

// Initialize email service
const emailService = new EmailService();

// Global functions for email service
function subscribeToNewsletter() {
    emailService.subscribeToNewsletter();
}

function sendPasswordReset() {
    emailService.sendPasswordReset();
}

function sendOrderConfirmation(orderData) {
    return emailService.sendOrderConfirmation(orderData);
}

function sendWelcomeEmail(userData) {
    return emailService.sendWelcomeEmail(userData);
}

// Export for global access
window.emailService = emailService;
window.subscribeToNewsletter = subscribeToNewsletter;
window.sendPasswordReset = sendPasswordReset;
window.sendOrderConfirmation = sendOrderConfirmation;
window.sendWelcomeEmail = sendWelcomeEmail; 