<?php

/**
 *	Import all the CSVs from Regionalization data into MySQL
 */

require __DIR__ . '/vendor/autoload.php';	// libs
require 'inc/header.php';	 				// settings
require 'inc/config.php';	 				// create database connection


// testing
$dirtests = 0;
$inserttests = 0;
$limit = 2;

// get list of directories
$path = '../../beckymasond.github.io/msa_data/';
$dirs = scandir($path);

// reporting
$directory_count = $total_file_count = 0;
$zip_file_count = $zip_missing_count = 0;
$csv_file_count = $csv_missing_count = 0;

// ACS scenarios
$scenarios = array(	"gen","hous","pov","trans");

// loop through directories
foreach ($dirs as $dir) {
	// exclude these directories
	if ($dir === '.' || $dir === '..' || $dir === '.DS_Store') continue;
	
	// count directories, sub-directories
	$directory_count++; 
	$subdirs = scandir($path.$dir);
	print ++$dirtests .". ". $dir ."/ [". count($subdirs)." files]\n";

	// look for ZIP ARCHIVE files in each $dir
	foreach ($scenarios as $scenario){
		
		// ZIP file path
		$zip = $dir ."_". $scenario ."_results.zip";

		// make sure file exists
		if (!file_exists($path.$dir."/".$zip)) {
			print "\t - ". $zip ." - ####### ZIP FILE MISSING ########"."\n";
			$zip_missing_count++;
			continue;
		}
		$zip_file_count++;
		
		// confirm ZIP exists
		$zArchive = new ZipArchive();
		if($zArchive->open($path.$dir."/".$zip) !== false ){
			print "\t - ". $zip . " [". $zArchive->numFiles ." files]\n";

			// CSV file paths
			$csv_filenames = array(	"crosswalk" => $dir ."_". $scenario ."_crosswalk.csv",
									"input_tracts" => $dir ."_". $scenario ."_input_tracts.csv",
									"output_regions" => $dir ."_". $scenario ."_output_regions.csv");
			
			// look for CSV files in each ZIP ARCHIVE
			foreach ($csv_filenames as $type => $csv){

				// if file exists
				if ($zArchive->locateName( $csv ) !== false){
					print "\t\t - ". $csv ."\n";
					$csv_file_count++;
					$total_file_count++;

					$file = "zip://". $path.$dir."/".$zip ."#". $csv;	// define CSV file path inside ZIP
					$csv_arr = array_map('str_getcsv', file($file));	// import CSV to array
					//print_r($csv_arr);
					$db_table_name = $dir."_".$scenario."_".$type;		// define db table name

					
					$csv_arr = removeCSVCols($csv_arr);					// remove columns we don't need
					$csv_col_names = returnCSVCols($csv_arr[0]);
					// create db table and insert CSV
					if (!createMySQLTable($db_table_name,$type,$scenario,$csv_col_names)) exit("\ncreateTable error");
					if (!insertCSVMySQL($db_table_name,$csv_arr,$csv_col_names)) exit("\insertCSVMySQL() error");
				


					

					if (++$inserttests >= 2) exit("\n\n $inserttests insert tests done\n\n");

				} else {
					print "\t\t - ". " - ####### ". $csv ." CSV FILE MISSING ########"."\n";	
					$csv_missing_count++;
				}
			}

			 
		} else {
			exit("ZIP archive error");
		}
	}
}



/**
 *	returnCSVCols()
 *	Remove columns from a CSV arr
 *	@param  Array $csv_arr CSV
 *	@return Array $result
 */
function removeCSVCols($csv_arr){
	$result = array(); 		// the result
	$keep_cols = array();	// col #s to keep

	// loop through each column in header row of csv
	foreach ($csv_arr[0] as $keyNum => $col){
		// keep these
		if ($col == "TID" || $col == "RID" || substr($col, 0, 1) !== "B" )
				$keep_cols[] = $keyNum;
	}
	// loop through ALL rows
	foreach ($csv_arr as $rowNum => $row){
		// arr of columns to keep
		$keep_row = array();	
		// loop through ALL cols
		foreach ($row as $keyNum => $col){
			// if col # is in $keep_cols
			if ( in_array($keyNum,$keep_cols) )
				// add it to keep_row
				$keep_row[] = $col;
		}
		$result[] = $keep_row;
	}
	//print_r($result);
	return $result;
}

/**
 *	returnCSVCols()
 *	@param  Array $header_row first line of CSV
 *	@return Array $cols - An array containing column names
 */
function returnCSVCols($header_row){
	// loop through each column in first line of csv
	$col_names = array();
	foreach ($header_row as $col){
		//if ($col == "TID" || $col == "RID" || substr($col, 0, 1) != "B" )
			$col_names[] = $col;
	}
	//print_r($col_names);
	return $col_names;
}

/**
 *	createMySQLTable()
 *	@param String - $db_table_name 
 *	@param String - $type "crosswalk","input_tracts","output_regions" 
 *	@param String - $scenario "gen","hous","pov","trans"
 */
function createMySQLTable($db_table_name,$type,$scenario,$csv_col_names){
	global $db;
	print "\t\t\t - Creating db table: ". $db_table_name ."\n";

	// drop db table if it exists
	$sql = "DROP TABLE IF EXISTS $db_table_name";
	$result = $db->rawQuery($sql);
	// error checking
	//if ($db->getLastErrno() === 0) echo "\nDROP TABLE succesfull";
	//else echo "\nDROP TABLE failed. Error: ". $db->getLastError();

	// determine db table create syntax
	$sql = "CREATE TABLE $db_table_name ( ";
	foreach($csv_col_names as $key => $col){
		if ($key > 0) $sql .= ",";
		// RID is a real integer
		if ($col == "RID")
			$sql .= "`$col` int(11) DEFAULT NULL";
		// TID is a string ... for now
		else if ($col == "TID")
			$sql .= "`$col` varchar(15) DEFAULT NULL";
		// all other columns
		else 
			$sql .= "`$col` varchar(35) DEFAULT NULL";
	}
	$sql .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
	//print "$sql\n";

	// run query
	$result = $db->rawQuery($sql);

	// error checking
	if ($db->getLastErrno() === 0){
		//echo "\nCREATE TABLE succesfull";
		return 1;
	} else {
		echo "\nCREATE TABLE failed. Error: ". $db->getLastError();
		return 0;
	}
}


/**
 *	insertData()
 *	@param String - $db_table_name 
 *	@param Array - $csv_arr Array of data to insert 
 *	@param Array - $csv_col_names
 */
function insertCSVMySQL($db_table_name,$csv_arr,$csv_col_names){
	global $db;
	print "\t\t\t - Inserting CSV into: ". $db_table_name ."\n";


		print_r("\n db_table_name: $db_table_name \n");

		print_r($csv_arr);
		print_r($csv_col_names);

		print_r("\n csv_arr row count: ". count($csv_arr));
		print_r("\n csv_col_names count: ". count($csv_col_names));

	// remove header row
	array_shift($csv_arr);

	// insert
	$result = $db->insertMulti($db_table_name, $csv_arr, $csv_col_names);

	// error checking
	if ($db->getLastErrno() === 0){
		//echo "\ninsertMulti succesfull";
		return 1;
	} else {
		echo "\ninsertMulti failed. Error: ". $db->getLastError();
		print_r($db_table_name);
		print_r($csv_arr);
		print_r($csv_col_names);
		return 0;
	}
}





// reporting
print $directory_count ." directory_count\n";
print $zip_file_count ." ZIP files (". $zip_missing_count ." missing)\n";
print $csv_file_count ." CSV files (". $csv_missing_count ." missing)\n";
print $total_file_count ." total files\n";








?>