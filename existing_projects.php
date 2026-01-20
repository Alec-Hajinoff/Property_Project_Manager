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

    $projectIds = array_column($projects, 'id'); // $projectIds creates an array of 'id' column values for each project. 

    $recordsByProject = [];
    if (!empty($projectIds)) {
        $placeholders = str_repeat('?,', count($projectIds) - 1) . '?';

        $recordsSql = "SELECT 
                        r.id,
                        r.project_id,
                        r.builder_id,
                        r.record_type,
                        r.title,
                        r.details,
                        r.record_datetime,
                        r.created_at,
                        p.id as party_id,
                        p.name as party_name,
                        p.type as party_type,
                        p.notes as party_notes,
                        p.created_at as party_created_at  
                      FROM records r
                      LEFT JOIN record_parties rp ON r.id = rp.record_id
                      LEFT JOIN parties p ON rp.party_id = p.id
                      WHERE r.project_id IN ($placeholders) 
                      AND r.builder_id = ?
                      ORDER BY r.record_datetime DESC, r.created_at DESC";

        $recordsStmt = $conn->prepare($recordsSql);

        $paramIndex = 1;
        foreach ($projectIds as $projectId) {
            $recordsStmt->bindValue($paramIndex++, $projectId, PDO::PARAM_INT);
        }
        $recordsStmt->bindValue($paramIndex, $builder_id, PDO::PARAM_INT);

        if (!$recordsStmt->execute()) {
            throw new Exception('Failed to fetch records with parties');
        }

        $allRecordsWithParties = $recordsStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($allRecordsWithParties as $row) {
            $projectId = $row['project_id'];
            $recordId = $row['id'];

            if (!isset($recordsByProject[$projectId][$recordId])) {
                $recordsByProject[$projectId][$recordId] = [
                    'id' => $recordId,
                    'project_id' => $projectId,
                    'builder_id' => $row['builder_id'],
                    'record_type' => $row['record_type'],
                    'title' => $row['title'],
                    'details' => $row['details'],
                    'record_datetime' => $row['record_datetime'],
                    'created_at' => $row['created_at'],
                    'parties' => []
                ];
            }

            if ($row['party_id'] !== null) {
                $party = [
                    'id' => $row['party_id'],
                    'name' => $row['party_name'],
                    'type' => $row['party_type'],
                    'notes' => $row['party_notes'],
                    'created_at' => $row['party_created_at']
                ];

                $partyExists = false;
                foreach ($recordsByProject[$projectId][$recordId]['parties'] as $existingParty) {
                    if ($existingParty['id'] == $party['id']) {
                        $partyExists = true;
                        break;
                    }
                }

                if (!$partyExists) {
                    $recordsByProject[$projectId][$recordId]['parties'][] = $party;
                }
            }
        }
    }

    foreach ($projects as &$project) {
        $projectId = $project['id'];
        if (isset($recordsByProject[$projectId])) {
            $project['records'] = array_values($recordsByProject[$projectId]);
        } else {
            $project['records'] = [];
        }
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
