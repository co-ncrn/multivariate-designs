<?php

/**
 *	Import all the CSVs, from each of the ZIPs in Regionalization data, into MySQL
 */

require __DIR__ . '/vendor/autoload.php';	// libs
require 'inc/header.php';	 				// settings
require 'inc/config.php';	 				// create database connection




$sql = "select TABLE_NAME from information_schema.tables where TABLE_SCHEMA=?;";
$tables = $db->rawQuery($sql, Array ('regionalization_full'));
foreach ($tables as $table) {
    //print_r ($table);

    // explode table name
	$arr = explode("_", $table["TABLE_NAME"]);

	// store vars for insert
	$data = Array ("msa" => $arr[0],"scenario" => $arr[1]);
	print implode(",", $data) ."\n";

	$id = $db->insert ('_metadata', $data);
	if($id)
	    echo ' -- row was created. Id=' . $id;

}




?>