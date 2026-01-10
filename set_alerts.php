<?php
require_once 'session_config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['id'];

try {
    $conn = new PDO('mysql:host=127.0.0.1;dbname=readings_from_sensors', 'root', '');
    $sql = 'INSERT INTO alerts (user_id, maxTemp, minTemp, maxHumidity, minHumidity) 
            VALUES (:user_id, :maxTemp, :minTemp, :maxHumidity, :minHumidity)
            ON DUPLICATE KEY UPDATE 
            maxTemp = VALUES(maxTemp),
            minTemp = VALUES(minTemp),
            maxHumidity = VALUES(maxHumidity),
            minHumidity = VALUES(minHumidity)';

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':user_id' => $userId,
        ':maxTemp' => $input['maxTemp'],
        ':minTemp' => $input['minTemp'],
        ':maxHumidity' => $input['maxHumidity'],
        ':minHumidity' => $input['minHumidity']
    ]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false]);
}
