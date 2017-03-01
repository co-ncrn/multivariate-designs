<?php

/**
 *	Import all the CSVs from Regionalization data into MySQL
 */

require __DIR__ . '/vendor/autoload.php';	// libs
require 'inc/header.php';	 				// settings
require 'inc/config.php';	 				// create database connection


// testing
$i = 0;

// get list of directories
$path = '../../beckymasond.github.io/msa_data/';
$dirs = scandir($path);

// reporting
$directories = $total_files = 0;
$zip_files = $zips_missing = 0;
$csv_files = $csvs_missing = 0;


// loop through directories
foreach ($dirs as $dir) {
	if ($dir === '.' || $dir === '..' || $dir === '.DS_Store') continue;
	$directories++;

	// count sub-directories
	$subdirs = scandir($path.$dir);
	print ++$i .". ". $dir ."/ [". count($subdirs)." files]\n";

	// ACS scenarios
	$scenarios = array(	"gen","hous","pov","trans");

	// look for ZIP ARCHIVE files in each $dir
	foreach ($scenarios as $scenario){
		
		// file ref
		$zip = $dir ."_". $scenario ."_results.zip";

		// make sure file exists
		if (!file_exists($path.$dir."/".$zip)) {
			print "\t - ". $zip ." - ####### ZIP FILE MISSING ########"."\n";
			$zips_missing++;
			continue;
		}
		$zip_files++;
		$zArchive = new ZipArchive();
		
		// confirm zip exists
		if($zArchive->open($path.$dir."/".$zip) !== false ){
			print "\t - ". $zip . " [". $zArchive->numFiles ." files]\n";

			// look for CSV files in each ZIP ARCHIVE


			// file ref
			$csvs = array(	"crosswalk" => $dir ."_". $scenario ."_crosswalk.csv",
							"input_tracts" => $dir ."_". $scenario ."_input_tracts.csv",
							"output_regions" => $dir ."_". $scenario ."_output_regions.csv");
			

			foreach ($csvs as $type => $csv){
				if ($zArchive->locateName( $csv ) !== false){
					print "\t\t - ". $csv ."\n";
					$csv_files++;
					$total_files ++;

					// csv file
					$file = "zip://". $path.$dir."/".$zip ."#". $csv;

					// import csv to array
					$arr = array_map('str_getcsv', file($file));
					
					// remove header rows (1)
					array_shift($arr);
					//print_r($arr);


					// table name
					$table = $dir."_".$scenario."_".$type;

					if (!createTable($table,$type)) exit("\ncreateTable error");
					if (!insertCSV($table,$arr,$type)) exit("\ninsertCSV error");
				


print $table ."\n";

exit();



				} else {
					print "\t\t - ". " - ####### ". $csv ." CSV FILE MISSING ########"."\n";	
					$csvs_missing++;
				}
			}


			 
		}
	}
	





/*


	print $dir ."\n";
	if(++$i > 0) exit();
*/
}



/**
 *	insertData()
 *	@param String - $table 
 *	@param Array - $arr Array of data to insert 
 *	@param String - $type "crosswalk","input_tracts","output_regions" 
 */
function insertCSV($table,$arr,$type){
	
	global $db;

	// columns
	if ($type == "crosswalk"){
		$cols = Array("RID", "TID");
	} else if ($type == "input_tracts"){
		$cols = Array("RID", "TID");
	} else if ($type == "output_regions"){
		$cols = Array("RID", "TID");
	}
	// insert
	$result = $db->insertMulti($table, $arr, $cols);
	if(!$result) {
		echo "\ninsert failed: " . $db->getLastError();
	} else {
		echo "\ninserted with following id\'s: " . implode(', ', $result);
	}

	if ($db->getLastErrno() === 0)
	    echo "\ninsertMulti succesfull";
	else
	    echo "\ninsertMulti failed. Error: ". $db->getLastError();

}



/**
 *	createTable()
 *	@param String - $table 
 *	@param String - $type "crosswalk","input_tracts","output_regions" 
 */
function createTable($table,$type){

	global $db;

	// drop table if it exists
	$sql = "DROP TABLE IF EXISTS $table";
	$result = $db->rawQuery($sql);

	if ($db->getLastErrno() === 0) echo "\nDROP TABLE succesfull";
	else echo "\nDROP TABLE failed. Error: ". $db->getLastError();

	// determine table create syntax
	if ($type == "crosswalk"){
		$sql = "CREATE TABLE $table (
					`RID` int(11) DEFAULT NULL,
					`TID` varchar(255) DEFAULT NULL
				) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
	} else if ($type == "input_tracts"){
		$sql = "CREATE TABLE $table (
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
		$sql = "CREATE TABLE $table (
				`RID` int(11) DEFAULT NULL,
				`TID` varchar(255) DEFAULT NULL
				) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
	}
	// run query
	$result = $db->rawQuery($sql);

	// check for errors
	if ($db->getLastErrno() === 0) echo "\nCREATE TABLE succesfull";
	else echo "\nCREATE TABLE failed. Error: ". $db->getLastError();

}




// reporting
print $directories ." directories\n";
print $zip_files ." ZIP files (". $zips_missing ." missing)\n";
print $csv_files ." CSV files (". $csvs_missing ." missing)\n";
print $total_files ." total files\n";








?>