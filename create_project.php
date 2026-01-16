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
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if ($input === null) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

// Validate and sanitise input
$project_address = isset($input['project_address']) ? trim($input['project_address']) : null;
$status = isset($input['status']) ? trim($input['status']) : null;

// Check required fields
if (!$project_address || !$status) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Validate status against allowed values
$allowed_statuses = ['Enquiry', 'Active', 'On hold', 'Completed'];
if (!in_array($status, $allowed_statuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid project status']);
    exit;
}

try {
    $project_sql = 'INSERT INTO projects (project_address, status, builder_id) 
                    VALUES (:project_address, :status, :builder_id)';
    $project_stmt = $conn->prepare($project_sql);
    $project_stmt->bindParam(':project_address', $project_address);
    $project_stmt->bindParam(':status', $status);
    $project_stmt->bindParam(':builder_id', $builder_id, PDO::PARAM_INT);

    if (!$project_stmt->execute()) {
        $errorInfo = $project_stmt->errorInfo();
        throw new Exception('Failed to create project: ' . ($errorInfo[2] ?? 'Unknown error'));
    }

    echo json_encode([
        'success' => true,
        'message' => 'Project created successfully'
    ]);
} catch (Exception $e) {
    error_log('Create project error: ' . $e->getMessage());

    $errorMessage = 'Failed to create project. Please try again.';
    if (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
        $errorMessage .= ' Debug: ' . $e->getMessage();
    }

    echo json_encode([
        'success' => false,
        'message' => $errorMessage
    ]);
} finally {
    if ($conn) {
        $conn = null;
    }
}
