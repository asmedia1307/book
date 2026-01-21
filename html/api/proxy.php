<?php
/**
 * Claude API Proxy
 * Proxies requests to Claude API to hide API key from frontend
 */

require_once 'config.php';

// Handle OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setJsonHeaders();
    exit;
}

setJsonHeaders();

// Start session and require authentication
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
requireAuth();

try {
    // Check if API key is configured
    if (empty(CLAUDE_API_KEY)) {
        sendError('Claude API key not configured', 500);
    }

    // Get request body
    $requestBody = file_get_contents('php://input');
    $requestData = json_decode($requestBody, true);

    if (!$requestData) {
        sendError('Invalid request data');
    }

    // Prepare headers for Claude API
    $headers = [
        'Content-Type: application/json',
        'x-api-key: ' . CLAUDE_API_KEY,
        'anthropic-version: 2023-06-01'
    ];

    // Initialize cURL
    $ch = curl_init(CLAUDE_API_URL);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $requestBody,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 120, // 2 minutes timeout
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    // Execute request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    curl_close($ch);

    // Handle cURL errors
    if ($response === false) {
        error_log("Claude API cURL error: " . $curlError);
        sendError('Failed to connect to Claude API', 500);
    }

    // Return response with same status code
    http_response_code($httpCode);
    setJsonHeaders();
    echo $response;

} catch (Exception $e) {
    error_log("Proxy error: " . $e->getMessage());
    sendError('An error occurred while processing the request', 500);
}
