<?php

/**
 *	Import all the CSVs from Regionalization data into MySQL
 */

require __DIR__ . '/vendor/autoload.php';	// libs
require 'inc/header.php';	 				// settings
require 'inc/config.php';	 				// create database connection


// testing
$dirtests = 0;
$tests = 0;
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
					$arr = array_map('str_getcsv', file($file));		// import CSV to array
					//print_r($arr);
					$db_table_name = $dir."_".$scenario."_".$type;		// define db table name

					// create db table and insert CSV
					$csv_col_names = returnCSVCols($arr[0]);
					//if (!createTable($db_table_name,$type,$scenario,$csv_col_names)) exit("\ncreateTable error");
					//if (!insertCSV($db_table_name,$arr,$type,$scenario,$csv_col_names)) exit("\ninsertCSV error");
				


					

					if (++$tests >= 3) exit("\n\n $tests tests done\n\n");

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
 *	@param  Array $header_row first line of CSV
 *	@return Array $cols 
 */
function returnCSVCols($header_row){
	// loop through each column in first line of csv
	$cols = array();
	foreach ($header_row as $col){
		if ($col == "TID" || $col == "RID" || substr($col, 0, 1) != "B" )
			$cols[] = $col;
	}
	//print_r($cols);
	return $cols;
}

/**
 *	createTable()
 *	@param String - $db_table_name 
 *	@param String - $type "crosswalk","input_tracts","output_regions" 
 *	@param String - $scenario "gen","hous","pov","trans"
 */
function createTable($db_table_name,$type,$scenario,$csv_col_names){
	global $db;
	print "\t\t - Creating db table: ". $db_table_name ."\n";

	// drop db table if it exists
	$sql = "DROP TABLE IF EXISTS $db_table_name";
	$result = $db->rawQuery($sql);
	// error checking
	if ($db->getLastErrno() === 0) echo "\nDROP TABLE succesfull";
	else echo "\nDROP TABLE failed. Error: ". $db->getLastError();





	// determine db table create syntax
	if ($type == "crosswalk"){
		$sql = "CREATE TABLE $db_table_name (
					`RID` int(11) DEFAULT NULL,
					`TID` varchar(255) DEFAULT NULL
				) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
	} else if ($type == "input_tracts"){
		$sql = "CREATE TABLE $db_table_name (
					`TID` varchar(255) DEFAULT NULL,
					/*`B17006_016E` int(11) DEFAULT NULL,
					`B25120_005M` varchar(255) DEFAULT NULL,
					`B17001_031E` int(11) DEFAULT NULL,
					`B23025_004E` int(11) DEFAULT NULL,
					`B17001_031M` int(11) DEFAULT NULL,
					`B23025_004M` int(11) DEFAULT NULL,
					`B25089_001M` varchar(255) DEFAULT NULL,
					`B25065_001E` varchar(255) DEFAULT NULL,
					`B17001_001E` int(11) DEFAULT NULL,
					`B25065_001M` varchar(255) DEFAULT NULL,
					`B17001_001M` int(11) DEFAULT NULL,
					`B25120_005E` varchar(255) DEFAULT NULL,
					`B17006_001E` int(11) DEFAULT NULL,
					`B23025_003E` int(11) DEFAULT NULL,
					`B25120_002E` varchar(255) DEFAULT NULL,
					`B17006_001M` int(11) DEFAULT NULL,
					`B23025_003M` int(11) DEFAULT NULL,
					`B25120_002M` varchar(255) DEFAULT NULL,
					`B25089_001E` varchar(255) DEFAULT NULL,
					`B17006_016M` int(11) DEFAULT NULL,
					`B01003_001E` int(11) DEFAULT NULL,
					`B01003_001M` int(11) DEFAULT NULL,*/
					`chabvpovE` varchar(255) DEFAULT NULL,
					`abvpovE` varchar(255) DEFAULT NULL,
					`employedE` varchar(255) DEFAULT NULL,
					`hsincownE` varchar(255) DEFAULT NULL,
					`hsincrentE` varchar(255) DEFAULT NULL,
					`chabvpovM` varchar(255) DEFAULT NULL,
					`abvpovM` varchar(255) DEFAULT NULL,
					`employedM` varchar(255) DEFAULT NULL,
					`hsincownM` varchar(255) DEFAULT NULL,
					`hsincrentM` varchar(255) DEFAULT NULL,
					`chabvpovCV` varchar(255) DEFAULT NULL,
					`abvpovCV` varchar(255) DEFAULT NULL,
					`employedCV` varchar(255) DEFAULT NULL,
					`hsincownCV` varchar(255) DEFAULT NULL,
					`hsincrentCV` varchar(255) DEFAULT NULL
				) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
	} else if ($type == "output_regions"){
		$sql = "CREATE TABLE $db_table_name (
				`RID` int(11) DEFAULT NULL,
				`TID` varchar(255) DEFAULT NULL
				) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
	}
	// run query
	$result = $db->rawQuery($sql);
	// error checking
	if ($db->getLastErrno() === 0) echo "\nCREATE TABLE succesfull";
	else echo "\nCREATE TABLE failed. Error: ". $db->getLastError();

}


/**
 *	insertData()
 *	@param String - $db_table_name 
 *	@param Array - $arr Array of data to insert 
 *	@param String - $type "crosswalk","input_tracts","output_regions" 
 *	@param String - $scenario "gen","hous","pov","trans"
 */
function insertCSV($db_table_name,$arr,$type,$scenario,$csv_col_names){
	
	global $db;

	// columns
	if ($type == "crosswalk"){
		$cols = Array("RID", "TID");
	} else if ($type == "input_tracts"){
		if ($scenario == "gen"){
			$cols = Array("TID","");
		} else if ($scenario == "hous"){
			$cols = Array("xxx");
		} else if ($scenario == "pov"){
			$cols = Array("xxx");
		} else if ($scenario == "trans"){
			$cols = Array("xxx");
		}
	} else if ($type == "output_regions"){
		$cols = Array("xxx");
	}
	// insert
	$result = $db->insertMulti($db_table_name, $arr, $cols);
	// error checking
	if ($db->getLastErrno() === 0) echo "\nninsertMulti succesfull";
	else echo "\nninsertMulti failed. Error: ". $db->getLastError();

}





// reporting
print $directory_count ." directory_count\n";
print $zip_file_count ." ZIP files (". $zip_missing_count ." missing)\n";
print $csv_file_count ." CSV files (". $csv_missing_count ." missing)\n";
print $total_file_count ." total files\n";








?>