<?php
/**
 * Authentication API Endpoint
 * Handles user login, registration, and session management
 */

require_once '../config/database.php';

class AuthAPI {
    private $conn;
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * User registration
     */
    public function register($data) {
        try {
            // Validate required fields
            $required = ['email', 'password', 'first_name', 'last_name'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return [
                        'success' => false,
                        'error' => "Field '$field' is required"
                    ];
                }
            }

            // Validate email format
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'error' => 'Invalid email format'
                ];
            }

            // Check password strength
            if (strlen($data['password']) < PASSWORD_MIN_LENGTH) {
                return [
                    'success' => false,
                    'error' => 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long'
                ];
            }

            // Check if email already exists
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'error' => 'Email already registered'
                ];
            }

            // Hash password
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

            // Insert new user
            $sql = "INSERT INTO users (email, password, first_name, last_name, phone, address, city, state, country, postal_code) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                $data['email'],
                $hashedPassword,
                $data['first_name'],
                $data['last_name'],
                $data['phone'] ?? null,
                $data['address'] ?? null,
                $data['city'] ?? null,
                $data['state'] ?? null,
                $data['country'] ?? 'Ghana',
                $data['postal_code'] ?? null
            ]);

            $userId = $this->conn->lastInsertId();

            // Get user data
            $user = $this->getUserById($userId);
            unset($user['password']); // Don't return password

            return [
                'success' => true,
                'message' => 'Registration successful',
                'data' => $user
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Registration failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * User login
     */
    public function login($data) {
        try {
            // Validate required fields
            if (empty($data['email']) || empty($data['password'])) {
                return [
                    'success' => false,
                    'error' => 'Email and password are required'
                ];
            }

            // Get user by email
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
            $stmt->execute([$data['email']]);
            $user = $stmt->fetch();

            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'Invalid email or password'
                ];
            }

            // Verify password
            if (!password_verify($data['password'], $user['password'])) {
                return [
                    'success' => false,
                    'error' => 'Invalid email or password'
                ];
            }

            // Create session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['login_time'] = time();

            // Update last login
            $stmt = $this->conn->prepare("UPDATE users SET updated_at = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);

            unset($user['password']); // Don't return password

            return [
                'success' => true,
                'message' => 'Login successful',
                'data' => $user
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Login failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * User logout
     */
    public function logout() {
        // Clear session
        session_destroy();
        
        return [
            'success' => true,
            'message' => 'Logout successful'
        ];
    }

    /**
     * Get current user
     */
    public function getCurrentUser() {
        if (!isset($_SESSION['user_id'])) {
            return [
                'success' => false,
                'error' => 'Not authenticated'
            ];
        }

        $user = $this->getUserById($_SESSION['user_id']);
        if (!$user) {
            return [
                'success' => false,
                'error' => 'User not found'
            ];
        }

        unset($user['password']); // Don't return password

        return [
            'success' => true,
            'data' => $user
        ];
    }

    /**
     * Update user profile
     */
    public function updateProfile($data) {
        if (!isset($_SESSION['user_id'])) {
            return [
                'success' => false,
                'error' => 'Not authenticated'
            ];
        }

        try {
            $userId = $_SESSION['user_id'];
            $updateFields = [];
            $values = [];

            // Fields that can be updated
            $allowedFields = ['first_name', 'last_name', 'phone', 'address', 'city', 'state', 'country', 'postal_code'];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (empty($updateFields)) {
                return [
                    'success' => false,
                    'error' => 'No fields to update'
                ];
            }

            $values[] = $userId;
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = ?";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($values);

            // Get updated user data
            $user = $this->getUserById($userId);
            unset($user['password']);

            return [
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Update failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Change password
     */
    public function changePassword($data) {
        if (!isset($_SESSION['user_id'])) {
            return [
                'success' => false,
                'error' => 'Not authenticated'
            ];
        }

        try {
            // Validate required fields
            if (empty($data['current_password']) || empty($data['new_password'])) {
                return [
                    'success' => false,
                    'error' => 'Current password and new password are required'
                ];
            }

            // Check password strength
            if (strlen($data['new_password']) < PASSWORD_MIN_LENGTH) {
                return [
                    'success' => false,
                    'error' => 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long'
                ];
            }

            $userId = $_SESSION['user_id'];

            // Get current password
            $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'User not found'
                ];
            }

            // Verify current password
            if (!password_verify($data['current_password'], $user['password'])) {
                return [
                    'success' => false,
                    'error' => 'Current password is incorrect'
                ];
            }

            // Hash new password
            $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);

            // Update password
            $stmt = $this->conn->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$hashedPassword, $userId]);

            return [
                'success' => true,
                'message' => 'Password changed successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Password change failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Forgot password
     */
    public function forgotPassword($data) {
        try {
            if (empty($data['email'])) {
                return [
                    'success' => false,
                    'error' => 'Email is required'
                ];
            }

            // Check if user exists
            $stmt = $this->conn->prepare("SELECT id, email, first_name FROM users WHERE email = ? AND is_active = 1");
            $stmt->execute([$data['email']]);
            $user = $stmt->fetch();

            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'Email not found'
                ];
            }

            // Generate reset token
            $resetToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // Store reset token (in a real app, you'd have a password_resets table)
            // For demo purposes, we'll just return success
            // In production, you'd send an email with the reset link

            return [
                'success' => true,
                'message' => 'Password reset instructions sent to your email',
                'data' => [
                    'email' => $user['email'],
                    'reset_token' => $resetToken, // In production, don't return this
                    'expires_at' => $expiresAt
                ]
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Password reset failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get user by ID
     */
    private function getUserById($userId) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = ? AND is_active = 1");
            $stmt->execute([$userId]);
            return $stmt->fetch();
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    public function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }

    /**
     * Check if user is admin
     */
    public function isAdmin() {
        return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
    }
}

// Handle API requests
$api = new AuthAPI();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'register':
                $result = $api->register($input);
                break;
                
            case 'login':
                $result = $api->login($input);
                break;
                
            case 'logout':
                $result = $api->logout();
                break;
                
            case 'update-profile':
                $result = $api->updateProfile($input);
                break;
                
            case 'change-password':
                $result = $api->changePassword($input);
                break;
                
            case 'forgot-password':
                $result = $api->forgotPassword($input);
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
            case 'me':
                $result = $api->getCurrentUser();
                break;
                
            case 'check-auth':
                $result = [
                    'success' => true,
                    'authenticated' => $api->isAuthenticated(),
                    'is_admin' => $api->isAdmin()
                ];
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
