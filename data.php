<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); 

$content = '';

if (file_exists(__DIR__ . '/data.txt')) {
	$content = file_get_contents(__DIR__ . '/data.txt');
}
	
echo json_encode(['data' => $content]);