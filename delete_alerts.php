<?php
require_once 'session_config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: DELETE');

if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false]);
    exit;
}

try {
    $conn = new PDO('mysql:host=127.0.0.1;dbname=readings_from_sensors', 'root', '');
    $stmt = $conn->prepare('DELETE FROM alerts WHERE user_id = ?');
    $stmt->execute([$_SESSION['id']]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false]);
}
