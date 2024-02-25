<?php
header('Content-Type: application/json');

$content = '';

if (file_exists(__DIR__ . '/data.txt')) {
	$content = file_get_contents(__DIR__ . '/data.txt');
}
	
echo json_encode(['data' => $content]);