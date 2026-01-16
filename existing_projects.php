<?php
require_once 'session_config.php';

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

$allowed_origins = [
    'http://localhost:3000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('HTTP/1.1 403 Forbidden');
    exit;
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'message' => 'Authentication required. Please log in.']);
    exit;
}

$builder_id = $_SESSION['id'];

$servername = '127.0.0.1';
$username = 'root';
$passwordServer = '';
$dbname = 'property_project_manager';

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $passwordServer);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    // Fetch projects for the logged-in builder
    $sql = 'SELECT project_address, status, created_at 
            FROM projects 
            WHERE builder_id = :builder_id 
            ORDER BY created_at DESC';

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':builder_id', $builder_id, PDO::PARAM_INT);

    if (!$stmt->execute()) {
        throw new Exception('Failed to fetch projects');
    }

    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return success response with projects
    echo json_encode([
        'success' => true,
        'projects' => $projects
    ]);
} catch (Exception $e) {
    // Log the actual error for debugging
    error_log('Fetch projects error: ' . $e->getMessage());

    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load projects. Please try again.'
    ]);
} finally {
    if ($conn) {
        $conn = null;
    }
}
