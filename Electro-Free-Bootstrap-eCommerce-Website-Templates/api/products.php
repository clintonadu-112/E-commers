<?php
/**
 * Products API Endpoint
 * Handles product listing, search, and individual product details
 */

require_once '../config/database.php';

class ProductAPI {
    private $conn;
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get all products with optional filters
     */
    public function getProducts($params = []) {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug,
                           GROUP_CONCAT(t.name) as tags
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN product_tags pt ON p.id = pt.product_id
                    LEFT JOIN tags t ON pt.tag_id = t.id
                    WHERE p.is_active = 1";
            
            $conditions = [];
            $values = [];

            // Category filter
            if (!empty($params['category'])) {
                $conditions[] = "c.slug = ?";
                $values[] = $params['category'];
            }

            // Search filter
            if (!empty($params['search'])) {
                $conditions[] = "(p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)";
                $searchTerm = '%' . $params['search'] . '%';
                $values[] = $searchTerm;
                $values[] = $searchTerm;
                $values[] = $searchTerm;
            }

            // Price range filter
            if (!empty($params['min_price'])) {
                $conditions[] = "p.price >= ?";
                $values[] = $params['min_price'];
            }
            if (!empty($params['max_price'])) {
                $conditions[] = "p.price <= ?";
                $values[] = $params['max_price'];
            }

            // Brand filter
            if (!empty($params['brand'])) {
                $conditions[] = "p.brand = ?";
                $values[] = $params['brand'];
            }

            // Featured products
            if (isset($params['featured']) && $params['featured']) {
                $conditions[] = "p.is_featured = 1";
            }

            if (!empty($conditions)) {
                $sql .= " AND " . implode(" AND ", $conditions);
            }

            $sql .= " GROUP BY p.id";

            // Sorting
            $sortBy = $params['sort'] ?? 'created_at';
            $sortOrder = $params['order'] ?? 'DESC';
            $allowedSortFields = ['name', 'price', 'rating_avg', 'created_at', 'sales_count'];
            
            if (in_array($sortBy, $allowedSortFields)) {
                $sql .= " ORDER BY p.$sortBy $sortOrder";
            } else {
                $sql .= " ORDER BY p.created_at DESC";
            }

            // Pagination
            $page = isset($params['page']) ? (int)$params['page'] : 1;
            $limit = isset($params['limit']) ? (int)$params['limit'] : ITEMS_PER_PAGE;
            $offset = ($page - 1) * $limit;
            
            $sql .= " LIMIT $limit OFFSET $offset";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($values);
            $products = $stmt->fetchAll();

            // Get total count for pagination
            $countSql = "SELECT COUNT(DISTINCT p.id) as total FROM products p
                        LEFT JOIN categories c ON p.category_id = c.id
                        LEFT JOIN product_tags pt ON p.id = pt.product_id
                        LEFT JOIN tags t ON pt.tag_id = t.id
                        WHERE p.is_active = 1";
            
            if (!empty($conditions)) {
                $countSql .= " AND " . implode(" AND ", $conditions);
            }
            
            $countStmt = $this->conn->prepare($countSql);
            $countStmt->execute($values);
            $totalCount = $countStmt->fetch()['total'];

            // Get product images
            foreach ($products as &$product) {
                $product['images'] = $this->getProductImages($product['id']);
                $product['tags'] = $product['tags'] ? explode(',', $product['tags']) : [];
            }

            return [
                'success' => true,
                'data' => $products,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit)
                ]
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get product by ID or slug
     */
    public function getProductById($identifier) {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug,
                           GROUP_CONCAT(t.name) as tags
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN product_tags pt ON p.id = pt.product_id
                    LEFT JOIN tags t ON pt.tag_id = t.id
                    WHERE p.is_active = 1 AND (p.id = ? OR p.slug = ?)
                    GROUP BY p.id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$identifier, $identifier]);
            $product = $stmt->fetch();

            if (!$product) {
                return [
                    'success' => false,
                    'error' => 'Product not found'
                ];
            }

            // Get product images
            $product['images'] = $this->getProductImages($product['id']);
            $product['tags'] = $product['tags'] ? explode(',', $product['tags']) : [];

            // Get related products
            $product['related_products'] = $this->getRelatedProducts($product['id'], $product['category_id']);

            // Increment view count
            $this->incrementProductViews($product['id']);

            return [
                'success' => true,
                'data' => $product
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get featured products
     */
    public function getFeaturedProducts($limit = FEATURED_PRODUCTS_LIMIT) {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.is_active = 1 AND p.is_featured = 1
                    ORDER BY p.rating_avg DESC, p.sales_count DESC
                    LIMIT ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$limit]);
            $products = $stmt->fetchAll();

            foreach ($products as &$product) {
                $product['images'] = $this->getProductImages($product['id']);
            }

            return [
                'success' => true,
                'data' => $products
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ];
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
     * Get related products
     */
    private function getRelatedProducts($productId, $categoryId, $limit = 4) {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.is_active = 1 AND p.id != ? AND p.category_id = ?
                    ORDER BY p.rating_avg DESC, p.sales_count DESC
                    LIMIT ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$productId, $categoryId, $limit]);
            $products = $stmt->fetchAll();

            foreach ($products as &$product) {
                $product['images'] = $this->getProductImages($product['id']);
            }

            return $products;
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Increment product views
     */
    private function incrementProductViews($productId) {
        try {
            $sql = "UPDATE products SET views = views + 1 WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$productId]);
        } catch (Exception $e) {
            // Silently fail
        }
    }

    /**
     * Search products
     */
    public function searchProducts($query, $filters = []) {
        $params = array_merge(['search' => $query], $filters);
        return $this->getProducts($params);
    }

    /**
     * Get product categories
     */
    public function getCategories() {
        try {
            $sql = "SELECT c.*, COUNT(p.id) as product_count
                    FROM categories c
                    LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
                    WHERE c.is_active = 1
                    GROUP BY c.id
                    ORDER BY c.name ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $categories = $stmt->fetchAll();

            return [
                'success' => true,
                'data' => $categories
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get brands
     */
    public function getBrands() {
        try {
            $sql = "SELECT DISTINCT brand, COUNT(*) as product_count
                    FROM products
                    WHERE is_active = 1 AND brand IS NOT NULL
                    GROUP BY brand
                    ORDER BY brand ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $brands = $stmt->fetchAll();

            return [
                'success' => true,
                'data' => $brands
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ];
        }
    }
}

// Handle API requests
$api = new ProductAPI();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = $api->getProductById($_GET['id']);
        } elseif (isset($_GET['search'])) {
            $result = $api->searchProducts($_GET['search'], $_GET);
        } elseif (isset($_GET['featured'])) {
            $result = $api->getFeaturedProducts($_GET['limit'] ?? FEATURED_PRODUCTS_LIMIT);
        } elseif (isset($_GET['categories'])) {
            $result = $api->getCategories();
        } elseif (isset($_GET['brands'])) {
            $result = $api->getBrands();
        } else {
            $result = $api->getProducts($_GET);
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
