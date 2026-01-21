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

    $conn->beginTransaction();
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$content_type = $_SERVER['CONTENT_TYPE'] ?? '';

if (strpos($content_type, 'multipart/form-data') !== false ||
        strpos($content_type, 'application/x-www-form-urlencoded') !== false) {
    $project_id = isset($_POST['project_id']) ? (int) $_POST['project_id'] : null;
    $builder_id = isset($_POST['builder_id']) ? (int) $_POST['builder_id'] : null;
    $record_type = isset($_POST['record_type']) ? trim($_POST['record_type']) : null;
    $title = isset($_POST['title']) ? trim($_POST['title']) : null;
    $details = isset($_POST['details']) ? trim($_POST['details']) : null;

    $party_data = null;
    if (isset($_POST['party']) && is_array($_POST['party'])) {
        $party_data = $_POST['party'];
    }
} else {
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
    $party_data = isset($input['party']) ? $input['party'] : null;
}

$party_id = null;

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

    if ($party_data !== null) {
        $party_name = isset($party_data['name']) ? trim($party_data['name']) : '';
        $party_type = isset($party_data['type']) ? trim($party_data['type']) : '';
        $party_notes = isset($party_data['notes']) ? trim($party_data['notes']) : '';

        if (!empty($party_name)) {
            $allowed_party_types = ['Client', 'Supplier', 'Subcontractor', 'Professional service (e.g. Architect)', 'Authority (e.g. Council)'];
            if (empty($party_type) || !in_array($party_type, $allowed_party_types)) {
                $party_type = 'Client';
            }

            $checkParty = $conn->prepare('SELECT id FROM parties WHERE builder_id = ? AND name = ?');
            $checkParty->execute([$builder_id, $party_name]);
            $existingParty = $checkParty->fetch();

            if ($existingParty) {
                $party_id = $existingParty['id'];

                if (!empty($party_notes)) {
                    $updateParty = $conn->prepare('UPDATE parties SET notes = COALESCE(?, notes), type = ? WHERE id = ?');
                    $updateParty->execute([$party_notes, $party_type, $party_id]);
                }
            } else {
                $createParty = $conn->prepare('INSERT INTO parties (builder_id, name, type, notes) VALUES (?, ?, ?, ?)');
                $createParty->execute([$builder_id, $party_name, $party_type, $party_notes]);
                $party_id = $conn->lastInsertId();
            }

            if ($party_id) {
                $linkParty = $conn->prepare('INSERT INTO record_parties (record_id, party_id) VALUES (?, ?)');
                $linkParty->execute([$record_id, $party_id]);

                if (!$linkParty->rowCount()) {
                    throw new Exception('Failed to link party to record');
                }
            }
        }
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Record created successfully',
        'record_id' => $record_id,
        'party_linked' => ($party_id !== null)
    ]);
} catch (Exception $e) {
    $conn->rollBack();

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
