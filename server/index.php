<?php
// index.php
date_default_timezone_set('Asia/Colombo');

require_once 'lib/Cors.php';
applyCorsHeaders();

require_once 'config/database.php';
require_once 'routes/web.php';
