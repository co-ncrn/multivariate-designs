<?php

/**
 *	Init MysqliDb db class
 *	https://github.com/joshcam/PHP-MySQLi-Database-Class
 *	install with composer...
 *	$ composer require joshcam/mysqli-database-class:dev-master
 */


$server = "";
//print_r($_SERVER);
if ( isset($_SERVER['SERVER_NAME']) ){
	if ( $_SERVER['SERVER_NAME'] == 'localhost' )
		$server = "localhost";
	else if ( $_SERVER['SERVER_NAME'] == 'owenmundy.com' )
		$server = "owenmundy.com";
} else if ( isset($_SERVER["HOME"]) ){
	// macbook
	if ( $_SERVER["HOME"] == "/Users/owmundy" ){
		$server = "localhost";
	// kiddo
	} else if ( $_SERVER["HOME"] == "/home/omundy" ){ 
		$server = "kiddo";
	}
} else {
	die("ERROR: server->HOME || server->SERVER_NAME not set.");
}  


if ($server == "localhost"){
	$db = new MysqliDb (Array ( 'host' => '127.0.0.1','username' => '','password' => '',
								 'db'=>'', 'port' => 3306, 'charset' => 'utf8'));
}		                		   




          		    

?>