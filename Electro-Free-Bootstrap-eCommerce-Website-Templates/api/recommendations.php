<?php
/**
 * Recommendations API Endpoint
 * Provides AI-powered product recommendations
 */

require_once '../config/database.php';

class RecommendationAPI {
    private $conn;
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get personalized recommendations for user
     */
    public function getPersonalizedRecommendations($userId = null, $limit = 8) {
        try {
            $recommendations = [];

            // If user is logged in, get personalized recommendations
            if ($userId) {
                $recommendations = array_merge(
                    $recommendations,
                    $this->getCollaborativeFilteringRecommendations($userId, $limit / 2),
                    $this->getContentBasedRecommendations($userId, $limit / 2)
                );
            }

            // Fill remaining slots with trending products
            $remainingSlots = $limit - count($recommendations);
            if ($remainingSlots > 0) {
                $trendingProducts = $this->getTrendingProducts($remainingSlots);
                $recommendations = array_merge($recommendations, $trendingProducts);
            }

            // Remove duplicates and limit results
            $recommendations = array_slice(array_unique($recommendations, SORT_REGULAR), 0, $limit);

            return [
                'success' => true,
                'data' => $recommendations,
                'type' => 'personalized'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to get recommendations: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get collaborative filtering recommendations
     */
    private function getCollaborativeFilteringRecommendations($userId, $limit = 4) {
        try {
            // Find users with similar behavior
            $sql = "SELECT DISTINCT ub2.user_id, COUNT(*) as similarity_score
                    FROM user_behavior ub1
                    JOIN user_behavior ub2 ON ub1.product_id = ub2.product_id 
                        AND ub1.action_type = ub2.action_type
                        AND ub1.user_id != ub2.user_id
                    WHERE ub1.user_id = ?
                    GROUP BY ub2.user_id
                    ORDER BY similarity_score DESC
                    LIMIT 5";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$userId]);
            $similarUsers = $stmt->fetchAll();

            if (empty($similarUsers)) {
                return [];
            }

            $similarUserIds = array_column($similarUsers, 'user_id');

            // Get products that similar users liked but current user hasn't seen
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug,
                           COUNT(ub.id) as popularity_score
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN user_behavior ub ON p.id = ub.product_id
                    WHERE p.is_active = 1
                    AND ub.user_id IN (" . implode(',', $similarUserIds) . ")
                    AND ub.action_type IN ('purchase', 'wishlist_add')
                    AND p.id NOT IN (
                        SELECT DISTINCT product_id 
                        FROM user_behavior 
                        WHERE user_id = ?
                    )
                    GROUP BY p.id
                    ORDER BY popularity_score DESC, p.rating_avg DESC
                    LIMIT ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$userId, $limit]);
            $products = $stmt->fetchAll();

            // Add product images
            foreach ($products as &$product) {
                $product['images'] = $this->getProductImages($product['id']);
            }

            return $products;

        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get content-based recommendations
     */
    private function getContentBasedRecommendations($userId, $limit = 4) {
        try {
            // Get user's recent product interactions
            $sql = "SELECT DISTINCT product_id, action_type
                    FROM user_behavior
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    LIMIT 10";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$userId]);
            $userInteractions = $stmt->fetchAll();

            if (empty($userInteractions)) {
                return [];
            }

            $productIds = array_column($userInteractions, 'product_id');

            // Get products with similar tags and categories
            $sql = "SELECT DISTINCT p.*, c.name as category_name, c.slug as category_slug,
                           COUNT(DISTINCT pt.tag_id) as tag_similarity
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN product_tags pt ON p.id = pt.product_id
                    WHERE p.is_active = 1
                    AND p.id NOT IN (" . implode(',', $productIds) . ")
                    AND (
                        p.category_id IN (
                            SELECT DISTINCT category_id 
                            FROM products 
                            WHERE id IN (" . implode(',', $productIds) . ")
                        )
                        OR pt.tag_id IN (
                            SELECT DISTINCT pt2.tag_id
                            FROM product_tags pt2
                            WHERE pt2.product_id IN (" . implode(',', $productIds) . ")
                        )
                    )
                    GROUP BY p.id
                    ORDER BY tag_similarity DESC, p.rating_avg DESC
                    LIMIT ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$limit]);
            $products = $stmt->fetchAll();

            // Add product images
            foreach ($products as &$product) {
                $product['images'] = $this->getProductImages($product['id']);
            }

            return $products;

        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get trending products
     */
    public function getTrendingProducts($limit = 8) {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.is_active = 1
                    ORDER BY p.sales_count DESC, p.views DESC, p.rating_avg DESC
                    LIMIT ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$limit]);
            $products = $stmt->fetchAll();

            // Add product images
            foreach ($products as &$product) {
                $product['images'] = $this->getProductImages($product['id']);
            }

            return $products;

        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get frequently bought together products
     */
    public function getFrequentlyBoughtTogether($productId, $limit = 4) {
        try {
            // Find products that are frequently bought together
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug,
                           COUNT(*) as frequency
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    JOIN (
                        SELECT oi2.product_id
                        FROM order_items oi1
                        JOIN order_items oi2 ON oi1.order_id = oi2.order_id
                        WHERE oi1.product_id = ? AND oi2.product_id != ?
                    ) co_products ON p.id = co_products.product_id
                    WHERE p.is_active = 1
                    GROUP BY p.id
                    ORDER BY frequency DESC, p.rating_avg DESC
                    LIMIT ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$productId, $productId, $limit]);
            $products = $stmt->fetchAll();

            // Add product images
            foreach ($products as &$product) {
                $product['images'] = $this->getProductImages($product['id']);
            }

            return $products;

        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get product recommendations based on category
     */
    public function getCategoryRecommendations($categoryId, $limit = 8) {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.is_active = 1 AND p.category_id = ?
                    ORDER BY p.rating_avg DESC, p.sales_count DESC
                    LIMIT ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$categoryId, $limit]);
            $products = $stmt->fetchAll();

            // Add product images
            foreach ($products as &$product) {
                $product['images'] = $this->getProductImages($product['id']);
            }

            return $products;

        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get product images
     */
    private function getProductImages($productId) {
        try {
            $sql = "SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$productId]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Track user behavior for recommendations
     */
    public function trackBehavior($data) {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            $sessionId = session_id();

            $sql = "INSERT INTO user_behavior (user_id, session_id, product_id, action_type, action_data, ip_address, user_agent)
                    VALUES (?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                $userId,
                $sessionId,
                $data['product_id'] ?? null,
                $data['action_type'],
                json_encode($data['action_data'] ?? []),
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);

            return [
                'success' => true,
                'message' => 'Behavior tracked successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to track behavior: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get recommendation statistics
     */
    public function getRecommendationStats() {
        try {
            // Total user interactions
            $sql = "SELECT COUNT(*) as total_interactions FROM user_behavior";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $totalInteractions = $stmt->fetch()['total_interactions'];

            // Unique users
            $sql = "SELECT COUNT(DISTINCT user_id) as unique_users FROM user_behavior WHERE user_id IS NOT NULL";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $uniqueUsers = $stmt->fetch()['unique_users'];

            // Popular products
            $sql = "SELECT p.name, COUNT(ub.id) as interaction_count
                    FROM products p
                    LEFT JOIN user_behavior ub ON p.id = ub.product_id
                    WHERE p.is_active = 1
                    GROUP BY p.id
                    ORDER BY interaction_count DESC
                    LIMIT 5";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $popularProducts = $stmt->fetchAll();

            return [
                'success' => true,
                'data' => [
                    'total_interactions' => $totalInteractions,
                    'unique_users' => $uniqueUsers,
                    'popular_products' => $popularProducts
                ]
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to get stats: ' . $e->getMessage()
            ];
        }
    }
}

// Handle API requests
$api = new RecommendationAPI();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        $userId = $_SESSION['user_id'] ?? null;
        
        switch ($action) {
            case 'personalized':
                $limit = $_GET['limit'] ?? 8;
                $result = $api->getPersonalizedRecommendations($userId, $limit);
                break;
                
            case 'trending':
                $limit = $_GET['limit'] ?? 8;
                $result = [
                    'success' => true,
                    'data' => $api->getTrendingProducts($limit),
                    'type' => 'trending'
                ];
                break;
                
            case 'frequently-bought':
                if (isset($_GET['product_id'])) {
                    $limit = $_GET['limit'] ?? 4;
                    $result = [
                        'success' => true,
                        'data' => $api->getFrequentlyBoughtTogether($_GET['product_id'], $limit),
                        'type' => 'frequently_bought'
                    ];
                } else {
                    $result = [
                        'success' => false,
                        'error' => 'Product ID is required'
                    ];
                }
                break;
                
            case 'category':
                if (isset($_GET['category_id'])) {
                    $limit = $_GET['limit'] ?? 8;
                    $result = [
                        'success' => true,
                        'data' => $api->getCategoryRecommendations($_GET['category_id'], $limit),
                        'type' => 'category'
                    ];
                } else {
                    $result = [
                        'success' => false,
                        'error' => 'Category ID is required'
                    ];
                }
                break;
                
            case 'stats':
                $result = $api->getRecommendationStats();
                break;
                
            default:
                $limit = $_GET['limit'] ?? 8;
                $result = $api->getPersonalizedRecommendations($userId, $limit);
                break;
        }
        break;

    case 'POST':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'track':
                $result = $api->trackBehavior($input);
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
