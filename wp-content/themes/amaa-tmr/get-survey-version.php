<?php
// Bypass WP Engine caching by using a separate file
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

echo json_encode([
    'version' => '1.0.9_' . md5(microtime(true) . rand(10000, 99999)),
    'timestamp' => microtime(true)
]);
?>
