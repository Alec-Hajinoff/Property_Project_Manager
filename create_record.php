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

    $attachments_processed = 0;
    if (isset($_FILES['attachments']) && is_array($_FILES['attachments']['name'])) {
        $allowed_mime_types = [
            'application/pdf' => 'pdf',
            'image/png' => 'png',
            'image/jpeg' => 'jpeg',
            'image/jpg' => 'jpg'
        ];

        for ($i = 0; $i < count($_FILES['attachments']['name']); $i++) {
            if ($_FILES['attachments']['error'][$i] === UPLOAD_ERR_OK) {
                $file_name = $_FILES['attachments']['name'][$i];
                $file_tmp_name = $_FILES['attachments']['tmp_name'][$i];
                $file_size = $_FILES['attachments']['size'][$i];
                $file_type = $_FILES['attachments']['type'][$i];

                if (!array_key_exists($file_type, $allowed_mime_types)) {
                    throw new Exception("Invalid file type for: $file_name. Only PDF, PNG, JPEG allowed.");
                }

                $file_content = file_get_contents($file_tmp_name);
                if ($file_content === false) {
                    throw new Exception("Failed to read file: $file_name");
                }

                $stmt = $conn->prepare('INSERT INTO attachments (record_id, file_name, file_data, file_type) 
                                        VALUES (:record_id, :file_name, :file_data, :file_type)');
                $stmt->bindParam(':record_id', $record_id, PDO::PARAM_INT);
                $stmt->bindParam(':file_name', $file_name);
                $stmt->bindParam(':file_data', $file_content, PDO::PARAM_LOB);
                $stmt->bindParam(':file_type', $file_type);

                if (!$stmt->execute()) {
                    throw new Exception("Failed to save attachment: $file_name");
                }

                $attachments_processed++;
            } elseif ($_FILES['attachments']['error'][$i] !== UPLOAD_ERR_NO_FILE) {
                $error_code = $_FILES['attachments']['error'][$i];
                throw new Exception("File upload error for: $file_name (Code: $error_code)");
            }
        }
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Record created successfully'
            . ($attachments_processed > 0 ? " with $attachments_processed attachment(s)" : ''),
        'record_id' => $record_id,
        'party_linked' => ($party_id !== null),
        'attachments_processed' => $attachments_processed
    ]);
} catch (Exception $e) {
    $conn->rollBack();

    error_log('Create record error: ' . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Failed to create record: ' . $e->getMessage()
    ]);
} finally {
    if ($conn) {
        $conn = null;
    }
}
