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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

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
    $projectsSql = 'SELECT id, builder_id, project_address, status, created_at 
                   FROM projects 
                   WHERE builder_id = :builder_id 
                   ORDER BY created_at DESC';

    $projectsStmt = $conn->prepare($projectsSql);
    $projectsStmt->bindParam(':builder_id', $builder_id, PDO::PARAM_INT);

    if (!$projectsStmt->execute()) {
        throw new Exception('Failed to fetch projects');
    }

    $projects = $projectsStmt->fetchAll(PDO::FETCH_ASSOC);

    $projectIds = array_column($projects, 'id');

    $recordsByProject = [];
    if (!empty($projectIds)) {
        $placeholders = str_repeat('?,', count($projectIds) - 1) . '?';

        $recordsSql = "SELECT id, project_id, record_type, title, details, record_datetime, created_at
                      FROM records 
                      WHERE project_id IN ($placeholders) 
                      AND builder_id = ?
                      ORDER BY record_datetime DESC, created_at DESC";

        $recordsStmt = $conn->prepare($recordsSql);

        $paramIndex = 1;
        foreach ($projectIds as $projectId) {
            $recordsStmt->bindValue($paramIndex++, $projectId, PDO::PARAM_INT);
        }
        $recordsStmt->bindValue($paramIndex, $builder_id, PDO::PARAM_INT);

        if (!$recordsStmt->execute()) {
            throw new Exception('Failed to fetch records');
        }

        $allRecords = $recordsStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($allRecords as $record) {
            $recordsByProject[$record['project_id']][] = $record;
        }
    }

    foreach ($projects as &$project) {
        $project['records'] = $recordsByProject[$project['id']] ?? [];
    }

    echo json_encode([
        'success' => true,
        'projects' => $projects
    ]);
} catch (Exception $e) {
    error_log('Fetch projects/records error: ' . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Failed to load projects. Please try again.'
    ]);
} finally {
    if ($conn) {
        $conn = null;
    }
}
