<?php
/**
 * Electro E-commerce Setup Script
 * Run this script to set up the database and configure the project
 */

echo "=== Electro E-commerce Setup ===\n\n";

// Check if required extensions are available
$required_extensions = ['pdo', 'pdo_mysql', 'json'];
$missing_extensions = [];

foreach ($required_extensions as $ext) {
    if (!extension_loaded($ext)) {
        $missing_extensions[] = $ext;
    }
}

if (!empty($missing_extensions)) {
    echo "❌ Missing required PHP extensions: " . implode(', ', $missing_extensions) . "\n";
    echo "Please enable these extensions in your php.ini file.\n\n";
    exit(1);
}

echo "✅ PHP extensions check passed\n";

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'electro_db';

try {
    // Connect to MySQL
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected to MySQL successfully\n";

    // Check if database exists
    $stmt = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$database'");
    $dbExists = $stmt->fetch();

    if ($dbExists) {
        echo "⚠️  Database '$database' already exists\n";
        echo "Do you want to recreate it? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);
        
        if (trim(strtolower($line)) !== 'y') {
            echo "Setup cancelled.\n";
            exit(0);
        }
        
        // Drop existing database
        $pdo->exec("DROP DATABASE IF EXISTS `$database`");
        echo "🗑️  Dropped existing database\n";
    }

    // Create database
    $pdo->exec("CREATE DATABASE `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Created database '$database'\n";

    // Select the database
    $pdo->exec("USE `$database`");

    // Read and execute SQL file
    $sqlFile = 'database/electro_db.sql';
    if (!file_exists($sqlFile)) {
        echo "❌ SQL file not found: $sqlFile\n";
        exit(1);
    }

    $sql = file_get_contents($sqlFile);
    
    // Remove the database creation part since we already created it
    $sql = preg_replace('/DROP DATABASE IF EXISTS.*?USE.*?;/s', '', $sql);
    
    // Execute SQL statements
    $statements = explode(';', $sql);
    $successCount = 0;
    $totalStatements = 0;

    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            try {
                $pdo->exec($statement);
                $successCount++;
            } catch (PDOException $e) {
                echo "⚠️  Warning: " . $e->getMessage() . "\n";
            }
            $totalStatements++;
        }
    }

    echo "✅ Executed $successCount/$totalStatements SQL statements\n";

    // Test database connection
    $testStmt = $pdo->query("SELECT COUNT(*) as user_count FROM users");
    $userCount = $testStmt->fetch()['user_count'];
    echo "✅ Database setup complete! Found $userCount users\n";

    // Create uploads directory
    $uploadsDir = 'uploads';
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
        echo "✅ Created uploads directory\n";
    }

    // Test API endpoints
    echo "\n=== Testing API Endpoints ===\n";
    
    $baseUrl = 'http://localhost/electro/api';
    $endpoints = [
        'products.php' => 'Products API',
        'auth.php?action=check-auth' => 'Authentication API',
        'recommendations.php' => 'Recommendations API'
    ];

    foreach ($endpoints as $endpoint => $name) {
        $url = $baseUrl . '/' . $endpoint;
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5
            ]
        ]);
        
        $response = @file_get_contents($url, false, $context);
        if ($response !== false) {
            echo "✅ $name: Working\n";
        } else {
            echo "❌ $name: Not accessible\n";
        }
    }

    echo "\n=== Setup Complete! ===\n";
    echo "🎉 Your Electro e-commerce project is ready!\n\n";
    
    echo "📋 Next Steps:\n";
    echo "1. Start XAMPP (Apache & MySQL)\n";
    echo "2. Place this project in: C:/xampp/htdocs/electro/\n";
    echo "3. Access your site at: http://localhost/electro/\n";
    echo "4. Admin login: admin@electro.com / admin123\n";
    echo "5. User login: user@electro.com / user123\n\n";
    
    echo "🔧 API Endpoints:\n";
    echo "- Products: http://localhost/electro/api/products.php\n";
    echo "- Auth: http://localhost/electro/api/auth.php\n";
    echo "- Orders: http://localhost/electro/api/orders.php\n";
    echo "- Recommendations: http://localhost/electro/api/recommendations.php\n\n";
    
    echo "📁 Project Structure:\n";
    echo "- Frontend: HTML/CSS/JS files\n";
    echo "- Backend: api/ directory\n";
    echo "- Database: database/electro_db.sql\n";
    echo "- Config: config/database.php\n\n";
    
    echo "🚀 Features Available:\n";
    echo "- User registration and authentication\n";
    echo "- Product browsing and search\n";
    echo "- Shopping cart and checkout\n";
    echo "- AI-powered recommendations\n";
    echo "- Order management\n";
    echo "- Admin panel\n\n";

} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "1. Make sure XAMPP is running\n";
    echo "2. Check if MySQL service is started\n";
    echo "3. Verify database credentials in config/database.php\n";
    echo "4. Ensure you have proper permissions\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Setup failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
