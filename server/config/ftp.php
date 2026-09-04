<?php
require_once __DIR__ . '/../lib/Env.php';

// FTP configuration settings loaded from environment
return [
    'ftp_server'   => Env::get('FTP_SERVER', 'ftp.payshia.com'),
    'ftp_username' => Env::get('FTP_USERNAME', 'dulaj@payshia.com'),
    'ftp_password' => Env::get('FTP_PASSWORD', ';noEzSOnp,(6Kge;'),
    'ftp_port'     => (int) Env::get('FTP_PORT', 21)
];
