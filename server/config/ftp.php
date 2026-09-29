<?php
require_once __DIR__ . '/../lib/Env.php';

// FTP configuration settings loaded from environment
return [
    'ftp_server'   => Env::get('FTP_SERVER', ''),
    'ftp_username' => Env::get('FTP_USERNAME', ''),
    'ftp_password' => Env::get('FTP_PASSWORD', ''),
    'ftp_port'     => (int) Env::get('FTP_PORT', 21)
];
