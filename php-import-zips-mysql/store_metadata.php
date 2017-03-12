<?php

/**
 *	Import all the CSVs, from each of the ZIPs in Regionalization data, into MySQL
 */

require __DIR__ . '/vendor/autoload.php';	// libs
require 'inc/header.php';	 				// settings
require 'inc/config.php';	 				// create database connection






// updates the descriptions in the database using csa_codes
function updateDescriptionsOnly(){
	global $db;
	$data = importCSV();

	//print_r($data);

	foreach ($data as $arr) {
		
		$db->where ('msa', $arr["msa"]);
		if ($db->update ('_metadata', $arr))
		    echo "\n". $db->count . ' records were updated';
		else
		    echo "\nupdate failed: " . $db->getLastError();

	}
}
// update just the descriptions
//updateDescriptionsOnly();




/**
 *	Import csa_codes.csv file and format
 *	file: Jul. 2015 [XLS - 418K] @ https://www.census.gov/population/metro/data/def.html
 */
function importCSV(){
	// get list of msa code descriptions
	$csv = array_map('str_getcsv', file("../data/csa_codes.csv"));
	//print_r($csv);
	// store them in $arr
	$arr = array();
	// loop through and format for db
	foreach($csv as $row){
		//print $row;
		//$arr[$temp[0]] = trim($temp[1]); // for [[msa => description], ...]
		$arr[] = array("msa"=>trim($row[0]),"description"=>trim($row[3])); // for [["msa" => val, "description" => val], ...]
	}
	print_r($arr);
	return $arr;
}
//importCSV();

/**
 *	Import csa_codes.tsv file and format
 */
function importTSV(){
	// get list of msa code descriptions
	$tsv = file("../data/msa_codes.tsv");
	// store them in $arr
	$arr = array();
	// loop through and format for db
	foreach($tsv as $row){
		//print $row;
		$temp = explode("   ", $row);
		//$arr[$temp[0]] = trim($temp[1]); // for [[msa => description], ...]
		$arr[] = array("msa"=>trim($temp[0]),"description"=>trim($temp[1])); // for [["msa" => val, "description" => val], ...]
	}
	//print_r($arr);
	return $arr;
}
//importTSV();


/**
 *	Loops through all data collected in tables and inserts msa,scenario,data in row of new table
 */
function insertMSA_Scenario(){
	global $db;
	$sql = "select TABLE_NAME from information_schema.tables where TABLE_SCHEMA=?;";
	$tables = $db->rawQuery($sql, Array ('regionalization_full'));
	foreach ($tables as $table) {
	    //print_r ($table);

	    // explode table name
		$arr = explode("_", $table["TABLE_NAME"]);



		// GET DATA NAMES 
		// use just the tracts table to get data names from columns
		if (strpos($table["TABLE_NAME"],"tracts")){

			// get the columns
			$sql = "SELECT `COLUMN_NAME` 
					FROM `INFORMATION_SCHEMA`.`COLUMNS` 
					WHERE `TABLE_SCHEMA`=? AND `TABLE_NAME`=?;";
			$cols = $db->rawQuery($sql, Array ('regionalization_full',$table["TABLE_NAME"]));

			// flatten array, removing duplicates and isolating just the names
			$cols_flat = array(); 
			foreach($cols as $c){
				//print $c["COLUMN_NAME"];
				if ($c["COLUMN_NAME"] != "TID" && $c["COLUMN_NAME"] != ""){
					// get just the name
					$name = preg_replace("([CV,E,M]+)", "", $c["COLUMN_NAME"]); 
					// if it isn't already in the array then add it
					if (!in_array($name, $cols_flat)) $cols_flat[] = $name;
				}

			}	
			// store vars for insert
			$data = Array ("msa" => $arr[0],"scenario" => $arr[1],"data" => implode(",", $cols_flat));
			print "\n". $table["TABLE_NAME"] ." => ". implode(",", $data);

			// insert with ON DUPLICATE KEY UPDATE
			$updateColumns = Array ("data");
			$lastInsertId = "msa";
			$db->onDuplicate($updateColumns, $lastInsertId);
			$id = $db->insert ('_metadata', $data);

			if($id)
			    echo $db->count . ' records were inserted/updated';
			else
			    echo "update failed: " . $db->getLastError();

		}
	}
}
// for starting off 
//insertMSA_Scenario(); 


?>