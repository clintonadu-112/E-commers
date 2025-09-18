<?php
/**
 * Orders API Endpoint
 * Handles order creation, management, and tracking
 */

require_once '../config/database.php';

class OrderAPI {
    private $conn;
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Create new order
     */
    public function createOrder($data) {
        if (!isset($_SESSION['user_id'])) {
            return [
                'success' => false,
                'error' => 'Authentication required'
            ];
        }

        try {
            // Validate required fields
            $required = ['items', 'shipping_address', 'phone', 'email'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return [
                        'success' => false,
                        'error' => "Field '$field' is required"
                    ];
                }
            }

            $userId = $_SESSION['user_id'];
            $items = $data['items'];

            if (empty($items) || !is_array($items)) {
                return [
                    'success' => false,
                    'error' => 'Order items are required'
                ];
            }

            // Calculate totals
            $subtotal = 0;
            $validItems = [];

            foreach ($items as $item) {
                if (empty($item['product_id']) || empty($item['quantity'])) {
                    continue;
                }

                // Get product details
                $stmt = $this->conn->prepare("SELECT * FROM products WHERE id = ? AND is_active = 1");
                $stmt->execute([$item['product_id']]);
                $product = $stmt->fetch();

                if (!$product) {
                    continue;
                }

                // Check stock
                if ($product['stock_quantity'] < $item['quantity']) {
                    return [
                        'success' => false,
                        'error' => "Insufficient stock for {$product['name']}"
                    ];
                }

                $itemTotal = $product['price'] * $item['quantity'];
                $subtotal += $itemTotal;

                $validItems[] = [
                    'product_id' => $product['id'],
                    'product_name' => $product['name'],
                    'product_sku' => $product['sku'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $product['price'],
                    'total_price' => $itemTotal
                ];
            }

            if (empty($validItems)) {
                return [
                    'success' => false,
                    'error' => 'No valid items in order'
                ];
            }

            // Calculate tax and shipping
            $taxAmount = $subtotal * (TAX_RATE / 100);
            $shippingAmount = $subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
            $totalAmount = $subtotal + $taxAmount + $shippingAmount;

            // Apply coupon if provided
            $discountAmount = 0;
            if (!empty($data['coupon_code'])) {
                $couponResult = $this->applyCoupon($data['coupon_code'], $subtotal, $userId);
                if ($couponResult['success']) {
                    $discountAmount = $couponResult['discount_amount'];
                    $totalAmount -= $discountAmount;
                }
            }

            // Generate order number
            $orderNumber = 'ORD-' . date('Y') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // Start transaction
            $this->conn->beginTransaction();

            try {
                // Create order
                $sql = "INSERT INTO orders (order_number, user_id, total_amount, subtotal, tax_amount, 
                        shipping_amount, discount_amount, payment_method, shipping_address, billing_address,
                        shipping_city, shipping_state, shipping_country, shipping_postal_code, phone, email, notes)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                $stmt = $this->conn->prepare($sql);
                $stmt->execute([
                    $orderNumber,
                    $userId,
                    $totalAmount,
                    $subtotal,
                    $taxAmount,
                    $shippingAmount,
                    $discountAmount,
                    $data['payment_method'] ?? 'mobile_money',
                    $data['shipping_address'],
                    $data['billing_address'] ?? $data['shipping_address'],
                    $data['shipping_city'] ?? null,
                    $data['shipping_state'] ?? null,
                    $data['shipping_country'] ?? 'Ghana',
                    $data['shipping_postal_code'] ?? null,
                    $data['phone'],
                    $data['email'],
                    $data['notes'] ?? null
                ]);

                $orderId = $this->conn->lastInsertId();

                // Create order items
                foreach ($validItems as $item) {
                    $sql = "INSERT INTO order_items (order_id, product_id, product_name, product_sku, 
                            quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    
                    $stmt = $this->conn->prepare($sql);
                    $stmt->execute([
                        $orderId,
                        $item['product_id'],
                        $item['product_name'],
                        $item['product_sku'],
                        $item['quantity'],
                        $item['unit_price'],
                        $item['total_price']
                    ]);

                    // Update product stock
                    $sql = "UPDATE products SET stock_quantity = stock_quantity - ?, 
                            sales_count = sales_count + ? WHERE id = ?";
                    $stmt = $this->conn->prepare($sql);
                    $stmt->execute([
                        $item['quantity'],
                        $item['quantity'],
                        $item['product_id']
                    ]);
                }

                // Track user behavior
                foreach ($validItems as $item) {
                    $this->trackUserBehavior($userId, $item['product_id'], 'purchase', [
                        'order_id' => $orderId,
                        'quantity' => $item['quantity']
                    ]);
                }

                $this->conn->commit();

                // Get complete order details
                $order = $this->getOrderById($orderId);

                return [
                    'success' => true,
                    'message' => 'Order created successfully',
                    'data' => $order
                ];

            } catch (Exception $e) {
                $this->conn->rollback();
                throw $e;
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Order creation failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get orders for current user
     */
    public function getOrders($params = []) {
        if (!isset($_SESSION['user_id'])) {
            return [
                'success' => false,
                'error' => 'Authentication required'
            ];
        }

        try {
            $userId = $_SESSION['user_id'];
            $sql = "SELECT o.*, COUNT(oi.id) as item_count
                    FROM orders o
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    WHERE o.user_id = ?
                    GROUP BY o.id
                    ORDER BY o.created_at DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$userId]);
            $orders = $stmt->fetchAll();

            // Get order items for each order
            foreach ($orders as &$order) {
                $order['items'] = $this->getOrderItems($order['id']);
            }

            return [
                'success' => true,
                'data' => $orders
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to get orders: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get order by ID
     */
    public function getOrderById($orderId) {
        if (!isset($_SESSION['user_id'])) {
            return [
                'success' => false,
                'error' => 'Authentication required'
            ];
        }

        try {
            $userId = $_SESSION['user_id'];
            $sql = "SELECT * FROM orders WHERE id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$orderId, $userId]);
            $order = $stmt->fetch();

            if (!$order) {
                return [
                    'success' => false,
                    'error' => 'Order not found'
                ];
            }

            $order['items'] = $this->getOrderItems($order['id']);

            return [
                'success' => true,
                'data' => $order
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to get order: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get order items
     */
    private function getOrderItems($orderId) {
        try {
            $sql = "SELECT oi.*, p.image_url, p.slug
                    FROM order_items oi
                    LEFT JOIN product_images p ON oi.product_id = p.product_id AND p.is_primary = 1
                    WHERE oi.order_id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$orderId]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Apply coupon
     */
    private function applyCoupon($couponCode, $subtotal, $userId) {
        try {
            $sql = "SELECT * FROM coupons WHERE code = ? AND is_active = 1 
                    AND (starts_at IS NULL OR starts_at <= NOW())
                    AND (expires_at IS NULL OR expires_at >= NOW())
                    AND (usage_limit IS NULL OR used_count < usage_limit)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$couponCode]);
            $coupon = $stmt->fetch();

            if (!$coupon) {
                return [
                    'success' => false,
                    'error' => 'Invalid or expired coupon'
                ];
            }

            if ($subtotal < $coupon['minimum_order_amount']) {
                return [
                    'success' => false,
                    'error' => 'Minimum order amount not met'
                ];
            }

            // Calculate discount
            if ($coupon['discount_type'] === 'percentage') {
                $discountAmount = $subtotal * ($coupon['discount_value'] / 100);
                if ($coupon['maximum_discount']) {
                    $discountAmount = min($discountAmount, $coupon['maximum_discount']);
                }
            } else {
                $discountAmount = $coupon['discount_value'];
            }

            return [
                'success' => true,
                'discount_amount' => $discountAmount,
                'coupon' => $coupon
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Coupon validation failed'
            ];
        }
    }

    /**
     * Track user behavior
     */
    private function trackUserBehavior($userId, $productId, $actionType, $actionData = []) {
        try {
            $sql = "INSERT INTO user_behavior (user_id, product_id, action_type, action_data, ip_address, user_agent)
                    VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                $userId,
                $productId,
                $actionType,
                json_encode($actionData),
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
        } catch (Exception $e) {
            // Silently fail
        }
    }

    /**
     * Get order status options
     */
    public function getOrderStatuses() {
        return [
            'success' => true,
            'data' => [
                'pending' => 'Pending',
                'processing' => 'Processing',
                'shipped' => 'Shipped',
                'delivered' => 'Delivered',
                'cancelled' => 'Cancelled'
            ]
        ];
    }

    /**
     * Get payment methods
     */
    public function getPaymentMethods() {
        return [
            'success' => true,
            'data' => [
                'mobile_money' => 'Mobile Money',
                'credit_card' => 'Credit Card',
                'bank_transfer' => 'Bank Transfer',
                'cash_on_delivery' => 'Cash on Delivery'
            ]
        ];
    }
}

// Handle API requests
$api = new OrderAPI();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'create':
                $result = $api->createOrder($input);
                break;
                
            default:
                $result = [
                    'success' => false,
                    'error' => 'Invalid action'
                ];
                http_response_code(400);
                break;
        }
        break;

    case 'GET':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'list':
                $result = $api->getOrders($_GET);
                break;
                
            case 'statuses':
                $result = $api->getOrderStatuses();
                break;
                
            case 'payment-methods':
                $result = $api->getPaymentMethods();
                break;
                
            default:
                if (isset($_GET['id'])) {
                    $result = $api->getOrderById($_GET['id']);
                } else {
                    $result = $api->getOrders($_GET);
                }
                break;
        }
        break;

    default:
        $result = [
            'success' => false,
            'error' => 'Method not allowed'
        ];
        http_response_code(405);
        break;
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
