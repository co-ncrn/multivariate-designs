<?php

/**
 *	Header.php - A number of development settings for showing errors, etc.
 *
 */



//if (!defined('DIRECT_ACCESS')) exit('No direct script access allowed');

// allow access from anywhere
header('Access-Control-Allow-Origin: *');


require_once ('om_functions.php');

// set utf8, file_output, and error reporting
set_file_utf8();
set_file_output('cli');
set_error_reporting(1);

// increase PHP memory limit
ini_set('memory_limit', '8000M');

error_reporting(E_ALL); // errors "on"
ini_set('display_errors',1); // comment out before going live
ini_set('display_startup_errors',1);
error_reporting(-1);


?>