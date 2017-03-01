
/**
 *	functions.js - Owen Mundy
 */


module.exports = {


	/**
	 *	Keep track of time
	 *	1. var start = time_tracker(null) to start
	 *	2. time_tracker(start) to get elapsed
	 */
	time_tracker: function(start){
		var time = new Date().getTime();
		if (start != null){
			var end = new Date().getTime();
			var time = end - start;
		}
		return time;
	},


	/**
	 *	parseTwitterDate() into a usable format
	 */
	parseTwitterDate: function(str) {

		/*
		//console.log(tweet.timestamp_ms); // sometimes undefined
		if (tweet.timestamp_ms !== undefined){
			var date = new Date(parseInt(tweet.timestamp_ms));
			console.log(date);
		}	
		*/
		
		return new Date(Date.parse(str.replace(/( +)/, ' UTC$1')));
	},



	/**
	 *	Make sure a property or method is:
	 *	1. declared
	 *	2. is !== null, undefined, NaN, empty string (""), 0, false
	 *	* like PHP isset()
	 */
	prop: function(val){
		if (typeof val !== 'undefined' && val){ 
			return true; 
		} else { 
			return false; 
		}
	}



};
