<?php
require_once 'session_config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');

if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false]);
    exit;
}

try {
    $conn = new PDO('mysql:host=127.0.0.1;dbname=readings_from_sensors', 'root', '');
    $stmt = $conn->prepare('SELECT maxTemp, minTemp, maxHumidity, minHumidity FROM alerts WHERE user_id = ?');
    $stmt->execute([$_SESSION['id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $result ?: null
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false]);
}
