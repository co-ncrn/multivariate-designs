<?php



/**
 *	clean_str()
 */
function clean_str($str){	
	// remove urls
	$str = preg_replace('#\bhttps?://[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|/))#', '', $str);
	// replace &amp; with &
	$str = str_replace("&amp;","&",$str);
	// remove Twitter user names
	$str = preg_replace('/@\w+/', '', $str);
	// specific character replacements 
	$str = str_replace(array("_","@")," ",$str);
	// !!! allow only these characters to remove strange foreign chars !!!
	$str = preg_replace("/[^#'. \w]+/", ' ', $str); 
	// remove multiple spaces (especially as a result of the above) 
	$str = preg_replace( '/\s+/', ' ', $str );
	// and other whitespace like returns
	$str = str_replace(array("\t","\r","\r\n")," ",$str);
	// trim ends
	$str = trim($str);
	// return clean string
	return $str;
}





// save log of activity into text file
// list of PHP modes: http://php.net/manual/en/function.fopen.php
function save_log($filename,$str,$mode="w"){
	$handle = fopen($filename, $mode) or die("Unable to open file!");
	fwrite($handle, "\n\n".$str."\n\n");
	fclose($handle);
	return true;
}


/**
 *	curl() - Download and return remote files
 */
function curl($url){
	
	// make sure cURL is installed
	if (!function_exists('curl_init')) die('Sorry cURL is not installed!');
	
	$ch = curl_init();							// create a new cURL resource handle
	
	// optional options
	curl_setopt($ch, CURLOPT_URL, $url);			// URL to download
    curl_setopt($ch, CURLOPT_REFERER, "");			// set referer
	$user_agents = array('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.74.9 (KHTML, like Gecko) Version/7.0.2 Safari/537.74.9','Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:27.0) Gecko/20100101 Firefox/27.0','Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36');
    curl_setopt($ch, CURLOPT_USERAGENT, $user_agents[array_rand($user_agents)]); // user agent
    curl_setopt($ch, CURLOPT_HEADER, 0);			// include header in result? (0 = yes, 1 = no)
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // return (true) or print (false) data?
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);			// timeout in seconds
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);	// return data as a string 
	
	
	$data = curl_exec($ch);		// store the response
	$info = curl_getinfo($ch);	// get info about the response
	
	if (empty($data)) {
		// some kind of an error happened
		die(curl_error($ch));
	    curl_close($ch); // close cURL handler
	}
	
	// check for an error
	if(curl_errno($ch)){// || $info['http_code'] == 302){
		
		print "\nhttp_code: ".$info['http_code'] ."\n";
		curl_close($ch);		// close connection
		return false;
	}
	
	
	curl_close($ch);		// close connection
	return $data;			// return data to let calling function write disk
}
// usage
//var_dump(curl("owenmundy.com"));
// or
//$file = curl($url);
//file_put_contents($path, $file);








// show memory usage
function Memory_Usage($decimals = 2) {
    $result = 0;

    if (function_exists('memory_get_usage')) {
    	// Returns the amount of memory in bytes that's currently being allocated to your PHP script.
        $result = memory_get_usage() / 1024;
    } else {
        if (function_exists('exec')) {
            $output = array();
            if (substr(strtoupper(PHP_OS), 0, 3) == 'WIN') {
                exec('tasklist /FI "PID eq ' . getmypid() . '" /FO LIST', $output);
                $result = preg_replace('/[\D]/', '', $output[5]);
            } else {
                exec('ps -eo%mem,rss,pid | grep ' . getmypid(), $output);
                $output = explode('  ', $output[0]);
                $result = $output[1];
            }
        }
    }
    // also see this method
    //echo "Length of details: " . strlen(serialize($details)) ."\n";
    
    return number_format(intval($result) / 1024, $decimals, '.', '');
}


/**
 *	Set error reporting
 */
function set_error_reporting($bool){
	if ($bool == 1) {
		// all errors "on"
		error_reporting(E_ALL); 
		ini_set('display_errors', 1);
		ini_set('display_startup_errors',1);
		error_reporting(-1);
	} else {
		// all errors "off"
		error_reporting(0); 
	}
}


/**
 *	Set file output
 */
function set_file_output($type){
	if ($type == 'html') {
		header('Content-Type: text/html; charset=utf-8');
		print '<html lang="en-us"><head><meta charset="utf-8"></head><body>';
	} elseif ($type == 'cli') {
		header('Content-Type: text/html; charset=utf-8');
	} elseif ($type == 'json') {
		header('Content-Type: application/json');
	}
}

/**
 *	Set file encoding to UTF-8
 */
function set_file_utf8(){
	
	if (function_exists("iconv") && PHP_VERSION_ID < 50600) {
		iconv_set_encoding("internal_encoding", "UTF-8");
		iconv_set_encoding("input_encoding", "UTF-8");
		iconv_set_encoding("output_encoding", "UTF-8");
	} elseif (PHP_VERSION_ID >= 50600) {
		ini_set("default_charset", "UTF-8");
	}
	// to confirm
	//var_dump(iconv_get_encoding('all'));
}






function create_unique_id($len){
	return substr(md5(uniqid(rand(), true)),0,$len);
}

function leading_zeros($pad_str,$pad_length){
	return str_pad($pad_str,$pad_length,'0',STR_PAD_LEFT);
}


/**
 *	Convert value from one number range to another
 */
function convertRange($old_value,$old_min,$old_max,$new_min,$new_max,$round=2){
	$old_range = ($old_max - $old_min); 
	$new_range = ($new_max - $new_min); 
	return round( (((($old_value - $old_min) * $new_range) / $old_range) + $new_min) ,2 );
}









/**
 *	Reporter
 */
function report($d,$h=110){
	print "<textarea style='width:100%; height:$h; color:#fff; background:rgba(50,50,50,.8); font-size:80%; font: 10px/12px monospace; position:relative; '>";
	print_r($d);
	print "</textarea>";
}

/**
 * Quit function for command line beep
 */
function quit(){
	// all done bell for terminal
	print exec('afplay /System/Library/Sounds/Purr.aiff ');
	die("\n\n####################### ALL DONE #######################\n\n");
}

/**
 *	Nap function for tricking robots while data scraping
 */
function nap($low=0,$high=1,$print=true){
	$seconds = rand( ($low*1000000),($high*1000000) );
	if ($print) print "sleeping ".round($seconds/1000000,2)." seconds";
	usleep( $seconds ); 
}

/**
 * Keep track of total time script takes to run
 *
 * @params	int $start_time UNIX timestamp
 * @return	float
 * @author	Owen Mundy <owenmundy.com>
 */
function time_tracker($start_time,$round=3)
{
	// determine how much time script is taking
	$m_time = microtime(); 
	$m_time = explode(" ",$m_time); 
	$m_time = $m_time[1] + $m_time[0]; 
	
	if ($start_time == NULL){
		// if undefined, return start time
		return $m_time; 
	} else {
		// $start_time is defined so figure out end time
		$end_time = $m_time; 
		$total_time = ($end_time - $start_time); 
		return round($total_time,$round);
	}
}
// start like...
// $start_time = time_tracker(NULL); // track response time
// get final time like...
// print "\nTotal time: ".round(time_tracker($start_time), 2) . " seconds\n";


// return hourly rate
function hourly_rate($requests,$minutes){
	//60/4 (minutes) = 20 * 1000 (records) = 20,000 /hour
	//60/120 (minutes) = .5 * 1000 (records) = 500 / hour
	if ($minutes <= 0) return 0;
	return floor( ((60/$minutes)) * $requests );	
}




?>