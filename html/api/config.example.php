<?php
/**
 * Database Configuration Template
 *
 * IMPORTANT: Copy this file to config.php and update with your settings
 * DO NOT commit config.php to git - it contains sensitive credentials
 */

// Database configuration
define('DB_HOST', 'mysql');
define('DB_NAME', 'book');
define('DB_USER', 'book');
define('DB_PASS', 'your_password_here');
define('DB_CHARSET', 'utf8mb4');

// Claude API configuration
define('CLAUDE_API_KEY', 'your_claude_api_key_here');
define('CLAUDE_API_URL', 'https://api.anthropic.com/v1/messages');

// Session configuration
define('SESSION_LIFETIME', 86400); // 24 hours

// Error reporting (set to false in production)
define('DEBUG_MODE', true);

/**
 * Get database connection
 */
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        if (DEBUG_MODE) {
            error_log("Database connection error: " . $e->getMessage());
        }
        throw new Exception("Database connection failed");
    }
}

/**
 * Set JSON headers
 */
function setJsonHeaders() {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

/**
 * Send JSON response
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    setJsonHeaders();
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    sendJsonResponse(['success' => false, 'error' => $message], $statusCode);
}
