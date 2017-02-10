<?php

// 
$file = '../../beckymasond.github.io/msa_data/16740/16740_tract.geojson';
$json = file_get_contents($file);	// get json string
$arr = json_decode($json, true);	// convert json to 2d array


foreach ($arr['features'] as $key => $value){
	//print_r($key) . ':' . print_r($value);
	print $key .". ". count('geometry') ."\n";
}


?>