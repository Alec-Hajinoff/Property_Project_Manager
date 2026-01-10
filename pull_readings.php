<?php

// This file fetches sensor data from the Things Network IoT server, puts it into database and sends it to the frontend.

require_once 'session_config.php';

require 'vendor/autoload.php';

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

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

header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

if (!isset($_SESSION['id'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$userId = (int) $_SESSION['id'];

$servername = '127.0.0.1';
$username = 'root';
$passwordServer = '';
$dbname = 'readings_from_sensors';

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $passwordServer);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$appId = 'readings-from-sensors';
$region = 'eu1';
$env = parse_ini_file(__DIR__ . '/.env');
$apiKey = $env['API_KEY'];

$url = "https://{$region}.cloud.thethings.network/api/v3/as/applications/{$appId}/packages/storage/uplink_message?limit=1&order=-received_at";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer {$apiKey}",
        'Accept: application/json'
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10
]);

$response = curl_exec($ch);
curl_close($ch);

preg_match('/\{(?:[^{}]|(?R))*\}/', $response, $matches);
$data = json_decode($matches[0], true);

$message = $data['result'];
$sensorData = $message['uplink_message']['decoded_payload'];

try {
    $sql = 'INSERT INTO readings (user_id, humidity, temperature, received_at) VALUES (:user_id, :humidity, :temperature, NOW())';  // Include user_id column in the insert
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);  // Bind the authenticated user ID to the query
    $stmt->bindParam(':humidity', $sensorData['humidity']);
    $stmt->bindParam(':temperature', $sensorData['temperature']);

    $stmt->execute();

    // Check if any alerts are set for this user
    $alertQuery = 'SELECT a.*, u.email 
                  FROM alerts a 
                  JOIN users u ON a.user_id = u.id 
                  WHERE a.user_id = :user_id';
    $alertStmt = $conn->prepare($alertQuery);
    $alertStmt->execute(['user_id' => $userId]);
    $alertSettings = $alertStmt->fetch(PDO::FETCH_ASSOC);

    // If alerts exist, check if thresholds are exceeded
    if ($alertSettings) {
        $alertNeeded = false;
        $alertMessage = "Alert: The following thresholds have been exceeded:\n\n";

        if ($alertSettings['maxTemp'] && $sensorData['temperature'] > $alertSettings['maxTemp']) {
            $alertMessage .= "Temperature above maximum: Current {$sensorData['temperature']}°C (Threshold: {$alertSettings['maxTemp']}°C)\n";
            $alertNeeded = true;
        }
        if ($alertSettings['minTemp'] && $sensorData['temperature'] < $alertSettings['minTemp']) {
            $alertMessage .= "Temperature below minimum: Current {$sensorData['temperature']}°C (Threshold: {$alertSettings['minTemp']}°C)\n";
            $alertNeeded = true;
        }
        if ($alertSettings['maxHumidity'] && $sensorData['humidity'] > $alertSettings['maxHumidity']) {
            $alertMessage .= "Humidity above maximum: Current {$sensorData['humidity']}% (Threshold: {$alertSettings['maxHumidity']}%)\n";
            $alertNeeded = true;
        }
        if ($alertSettings['minHumidity'] && $sensorData['humidity'] < $alertSettings['minHumidity']) {
            $alertMessage .= "Humidity below minimum: Current {$sensorData['humidity']}% (Threshold: {$alertSettings['minHumidity']}%)\n";
            $alertNeeded = true;
        }

        // Send email if any threshold was exceeded
        if ($alertNeeded) {
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = $env['USERNAME'];
                $mail->Password = $env['PASSWORD'];
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;

                $mail->setFrom($env['USERNAME'], 'Sensor Alert System');
                $mail->addAddress($alertSettings['email']);

                $mail->isHTML(true);
                $mail->Subject = 'Sensor Reading Alert';
                $mail->Body = nl2br($alertMessage);
                $mail->AltBody = strip_tags($alertMessage);

                $mail->send();
            } catch (Exception $e) {
                // Log email error but continue with response
                error_log('Email alert failed: ' . $mail->ErrorInfo);
            }
        }
    }
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'data' => [
            'temperature' => $sensorData['temperature'],
            'humidity' => $sensorData['humidity'],
            'inserted_at' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database insert failed']);
}

$conn = null;
