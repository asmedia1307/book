<?php
/**
 * Authentication API
 * Handles user login, logout, and session management
 */

require_once 'config.php';

// Handle OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setJsonHeaders();
    exit;
}

setJsonHeaders();

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    // Get request body
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['action'])) {
        sendError('Invalid request');
    }

    $action = $input['action'];

    switch ($action) {
        case 'login':
            handleLogin($input);
            break;

        case 'logout':
            handleLogout();
            break;

        case 'check':
            handleCheckAuth();
            break;

        case 'register':
            handleRegister($input);
            break;

        default:
            sendError('Invalid action');
    }

} catch (Exception $e) {
    error_log("Auth error: " . $e->getMessage());
    sendError('An error occurred during authentication');
}

/**
 * Handle user login
 */
function handleLogin($input) {
    if (!isset($input['username']) || !isset($input['password'])) {
        sendError('Username and password required');
    }

    $username = sanitizeInput($input['username']);
    $password = $input['password']; // Don't sanitize password

    try {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            // Use same error message for both cases to prevent username enumeration
            sendError('Invalid username or password', 401);
        }

        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            sendError('Invalid username or password', 401);
        }

        // Set session
        session_regenerate_id(true); // Prevent session fixation
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['login_time'] = time();

        sendJsonResponse([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username']
            ]
        ]);

    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        sendError('Login failed');
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    // Destroy session
    $_SESSION = [];

    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }

    session_destroy();

    sendJsonResponse(['success' => true, 'message' => 'Logged out successfully']);
}

/**
 * Check authentication status
 */
function handleCheckAuth() {
    if (isAuthenticated()) {
        sendJsonResponse([
            'success' => true,
            'authenticated' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username']
            ]
        ]);
    } else {
        sendJsonResponse([
            'success' => true,
            'authenticated' => false
        ]);
    }
}

/**
 * Handle user registration (optional - can be disabled in production)
 */
function handleRegister($input) {
    // DISABLED IN PRODUCTION - uncomment to allow registration
    sendError('Registration is currently disabled', 403);

    /*
    if (!isset($input['username']) || !isset($input['password'])) {
        sendError('Username and password required');
    }

    $username = sanitizeInput($input['username']);
    $password = $input['password'];

    // Validate username
    if (strlen($username) < 3 || strlen($username) > 50) {
        sendError('Username must be between 3 and 50 characters');
    }

    // Validate password
    if (strlen($password) < 6) {
        sendError('Password must be at least 6 characters');
    }

    try {
        $pdo = getDbConnection();

        // Check if username exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            sendError('Username already exists');
        }

        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Insert user
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
        $stmt->execute([$username, $passwordHash]);

        $userId = $pdo->lastInsertId();

        // Set session
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['login_time'] = time();

        sendJsonResponse([
            'success' => true,
            'user' => [
                'id' => $userId,
                'username' => $username
            ]
        ]);

    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        sendError('Registration failed');
    }
    */
}
