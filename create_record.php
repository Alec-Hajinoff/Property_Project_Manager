<?php
require_once 'session_config.php';

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

if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'message' => 'Authentication required. Please log in.']);
    exit;
}

$session_builder_id = $_SESSION['id'];

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

$input = json_decode(file_get_contents('php://input'), true);
if ($input === null) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$project_id = isset($input['project_id']) ? (int) $input['project_id'] : null;
$builder_id = isset($input['builder_id']) ? (int) $input['builder_id'] : null;
$record_type = isset($input['record_type']) ? trim($input['record_type']) : null;
$title = isset($input['title']) ? trim($input['title']) : null;
$details = isset($input['details']) ? trim($input['details']) : null;

if (!$project_id || !$builder_id || !$record_type || !$title) {
    echo json_encode(['success' => false, 'message' => 'All fields except details are required']);
    exit;
}

if ($builder_id !== $session_builder_id) {
    echo json_encode(['success' => false, 'message' => 'Authorization failed']);
    exit;
}

try {
    $checkProject = $conn->prepare('SELECT id FROM projects WHERE id = ? AND builder_id = ?');
    $checkProject->execute([$project_id, $builder_id]);
    $projectExists = $checkProject->fetch();

    if (!$projectExists) {
        echo json_encode(['success' => false, 'message' => 'Project not found or access denied']);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Validation failed']);
    exit;
}

$allowed_record_types = ['Agreement', 'Variation', 'Approval', 'Delivery', 'Issue', 'Milestone', 'General'];
if (!in_array($record_type, $allowed_record_types)) {
    echo json_encode(['success' => false, 'message' => 'Invalid record type']);
    exit;
}

try {
    $sql = 'INSERT INTO records (project_id, builder_id, record_type, title, details) 
            VALUES (:project_id, :builder_id, :record_type, :title, :details)';

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':project_id', $project_id, PDO::PARAM_INT);
    $stmt->bindParam(':builder_id', $builder_id, PDO::PARAM_INT);
    $stmt->bindParam(':record_type', $record_type);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':details', $details);

    if (!$stmt->execute()) {
        $errorInfo = $stmt->errorInfo();
        throw new Exception('Failed to create record: ' . ($errorInfo[2] ?? 'Unknown error'));
    }

    $record_id = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Record created successfully',
        'record_id' => $record_id
    ]);
} catch (Exception $e) {
    error_log('Create record error: ' . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Failed to create record. Please try again.'
    ]);
} finally {
    if ($conn) {
        $conn = null;
    }
}
