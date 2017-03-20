/**
 *	db_calls.js: handle requests from routes.js
 */


// all the scenarios and their datatypes, for validation
const scenarios_data = {
	"gen": ["occupied","married","bachdeg","samehous","white","black","hisp","under18","65over","avgrooms","avghhinc","pphh"],
	"hous": ["occupied","pctown","pctrent","snglfmly","avgrooms","avghmval","avgrent"],
	"pov": ["chabvpov","abvpov","employed","hsincown","hsincrent"],
	"trans": ["drvlone","transit","vehiclpp","avgcmmte"]
};
//var scenarios = ["gen","hous","pov","trans"];
const scenarios = Object.keys(scenarios_data);


/** 
 * 	root / status check
 *	TEST: http://localhost:3000/
 */
exports.root = function (request, reply) {
	// check binding
	if (!this.db) console.log("db: " + JSON.stringify(this.db));
	var timer = new Date();
	var meta = {
		request: "/",
		took: new Date()-timer,
		status: "ok"
	};	
	reply(meta);
};

/** 
 * 	Get all data for an MSA + scenario + data type
 *	
 *	TEST: http://localhost:3000/api/{msa}/{scenario}/{data}
 *		  http://localhost:3000/api/10180/hous/pctown
 *		  http://localhost:3000/api/16740/gen/married
 */
exports.get_MSA_scenario_data = function(request, reply) {
	var timer = new Date();
	var meta = { request: "get_MSA_scenario_data", params: {}, took: 0 }

	console.log(request.params);

	// confirm required params received
	if (!request.params || (!request.params.msa || !request.params.scenario || !request.params.data))
		return reply('Missing parameter(s)').code(404);

	// sanitize input
	meta.params = { msa: this.sanitizer.escape(request.params.msa), 
					scenario: this.sanitizer.escape(request.params.scenario), 
					data: this.sanitizer.escape(request.params.data) };

	// validate MSA: is it a valid int between min/max?
	if ( !this.validator.isInt(meta.params.msa, { min: 10180, max: 49740 }))
		return reply('that MSA does not exist').code(404);
	// validate scenario: does it exist inside scenarios_data keys?
	if ( !this.validator.isIn(meta.params.scenario, scenarios))
		return reply('that scenario does not exist').code(404);
	// validate data: does it exist inside scenarios_data object?
	if ( !this.validator.isIn(meta.params.data, scenarios_data[meta.params.scenario]))
		return reply('that data does not exist').code(404);

/*
// testing, pain in the butt
	if(this.fs.validateMSA(meta.params.msa,this.validator))
		return reply('that MSA does not exist').code(404);
*/

	var data = meta.params.data;
	var m_s = meta.params.msa +'_'+ meta.params.scenario;

	// join three tables with crosswalk
	/*
	SELECT t.TID, c.RID, t.drvloneE as t_drvloneE, r.drvloneE as r_drvloneE, 
		t.drvloneM as t_drvloneM, r.drvloneM as r_drvloneM, 
		t.drvloneCV as t_drvloneCV, r.drvloneCV as r_drvloneCV
	FROM 16740_trans_input_tracts t, 16740_trans_output_regions r, 16740_trans_crosswalk c
	WHERE t.TID = c.TID AND r.RID = c.RID
	ORDER BY RID;
	*/
	var sql = 'SELECT t.TID, c.RID, '+
					't.'+data+'E as t_'+data+'E, r.'+data+'E as r_'+data+'E, ' +
					't.'+data+'M as t_'+data+'M, r.'+data+'M as r_'+data+'M, ' + 
					't.'+data+'CV as t_'+data+'CV, r.'+data+'CV as r_'+data+'CV ' +
				'FROM '+ m_s +'_input_tracts t, '+
				    m_s +'_output_regions r, '+
				    m_s +'_crosswalk c ' +
				'WHERE t.TID = c.TID AND r.RID = c.RID ' +
				'ORDER BY RID;';


	console.log(sql);

	// perform query
	this.db.query(sql, function (error, results, fields) {
		if (error) throw error;

		//console.log('results[0].TID: ', results[0].TID); // test
		meta.response = results;		// return all results
		meta.took = new Date()-timer;	// update timer
		reply(meta);					// send response
	});
};





/** 
 * 	Return list of MSA + scenario + data types
 *	
 *	TEST: http://localhost:3000/_metadata/{msa?}
 *		  http://localhost:3000/_metadata		<---- all MSAs
 *		  http://localhost:3000/_metadata/10180 <---- specific MSA
 *		  http://localhost:3000/_metadata/16740
 */
// return all msa/scenarios
exports.get_metadata = function(request, reply) {
	var timer = new Date();
	var meta = { request: "get_metadata", took: 0 }
	var sql = "SELECT msa,scenario,data,description,geo FROM _metadata ";
	console.log(request.params);

	// if params received
	if (request.params && request.params.msa){
		// sanitize input
		meta.params = { msa: this.sanitizer.escape(request.params.msa) };

		// validate MSA: is it a valid int between min/max?
		if ( !this.validator.isInt(meta.params.msa, { min: 10180, max: 49740 })){
			return reply('that MSA does not exist').code(404);
		} else {
			sql += ' WHERE msa='+ meta.params.msa;
		}
	}
	// finish sql
	sql += ' ORDER BY msa;';

	console.log(sql);


	// perform query
	this.db.query(sql, function (error, results, fields) {
		if (error) throw error;
		//console.log(results);

		// There are 3-4 of each MSA
		// - put them in objects with the msa code as their key
		// - format results like { msa: [ {scenario, scenario, ... }, ... ]
		//						 {"10380":[ { a:1,b:2},{ c:3,d:4}, ... ]}

		// response, temp array for scenarios, previous msa code
		var response = {}, temp = [], prev_msa = 0;

		// loop through objects
		for(var i=0; i<results.length; i++){
			
			var msa = results[i].msa;
			//console.log(msa);

			// convert data string to an array
			results[i].data = results[i].data.split(",");	

			// if this is the first run
			if (prev_msa == 0){
				prev_msa = msa;				// update msa
			}
			// if this is a new one
			else if (prev_msa != msa){
				temp = [];					// reset temp
				prev_msa = results[i].msa;	// update msa
			}
			response[msa] = temp; 			// push temp into response
			temp.push(results[i]);			// push current object
		}
		response[msa] = temp; // in case there was only one msa, push last temp into response

		meta.response = response;		// return all results
		meta.took = new Date()-timer;	// update timer
		reply(meta);					// send response
	});



};








// in future may need this to get only one TID

exports.get_MSA_scenario_TID = function(request, reply) {
	//if (request.params.tid) meta.params.tid = this.sanitizer.escape(request.params.tid);
	// simple query
	//var sql = 'SELECT * FROM '+ this.db.escapeId(meta.params.msa +'_'+ meta.params.scenario +'_input_tracts') ;
};
// catch everything
exports.catchAll_api = function(request, reply) {
	return reply('that endpoint requires an msa/scenario/datatype').code(404);
};
// catch everything
exports.catchAll = function(request, reply) {
	return reply('that endpoint does not exist').code(404);	
};

