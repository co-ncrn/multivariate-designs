
/**
 *	functions.js - Owen Mundy
 */


module.exports = {


	/**
	 *	Validate MSA
	 *	- make sure MSA is integer and between 10180-49740
	 */
	validateMSA: function(msa,validator){
		console.log(validator)

		if ( validator.isInt( msa, { min: 10180, max: 49740 })){
			return true;
		} else {
			return false;
		}
	},
	/**
	 *	Validate MSA
	 *	- make sure MSA is integer and between 10180-49740
	 */
	validateScenario: function(scenario){
		// make sure MSA is integer and between 10180-49740
		if ( this.validator.isInt( scenario, { min: 10180, max: 49740 })){
			return true;
		} else {
			return false;
		}
	},



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
