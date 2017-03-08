/**
 *	db_calls.js: handle requests from routes.js
 */

//var scenarios = ["gen","hous","pov","trans"];

var scenarios_data = {
	"gen": ["occupied","married","bachdeg","samehous","white","black","hisp","under18","65over","avgrooms","avghhinc","pphh"],
	"hous": ["occupied","pctown","pctrent","snglfmly","avgrooms","avghmval","avgrent"],
	"pov": ["chabvpov","abvpov","employed","hsincown","hsincrent"],
	"trans": ["drvlone","transit","vehiclpp","avgcmmte"]
};
var scenarios = Object.keys(scenarios_data);


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
		status: "ok",
		took: new Date()-timer
	};	
	reply(meta);
};

/** 
 * 	Get all data for an MSA + scenario
 *	
 *	TEST: http://localhost:3000/api/{msa}/{scenario}/
 *		  http://localhost:3000/api/10180/gen/
 */
exports.get_MSA_scenario_data = function(request, reply) {
	var timer = new Date();
	var meta = { request: "get_MSA_scenario_data", params: {} }

	// confirm MSA and scenario received
	if (!request.params && !request.params.msa && !request.params.scenario)
		return reply('Missing parameter(s)').code(404);

	// sanitize input
	meta.params = { msa: this.sanitizer.escape(request.params.msa), 
					scenario: this.sanitizer.escape(request.params.scenario), 
					data: this.sanitizer.escape(request.params.data) };

console.log(scenarios);

	// validate MSA
	//if ( this.fs.validateMSA(request.params.msa) ){
	if ( !this.validator.isInt(meta.params.msa, { min: 10180, max: 49740 }))
		return reply('that MSA does not exist').code(404);
	// validate scenario
	if ( !this.validator.isIn(meta.params.scenario, scenarios))
		return reply('that scenario does not exist').code(404);
	// validate scenario
	if ( !this.validator.isIn(meta.params.data, scenarios_data[meta.params.scenario]))
		return reply('that data does not exist').code(404);


	var data = meta.params.data;

	// join three tables with crosswalk
	var sql = 'SELECT t.TID, c.RID, t.'+data+'E as t_'+data+'E, r.'+data+'E as r_'+data+'E, ' +
					't.'+data+'M as t_'+data+'M, r.'+data+'M as r_'+data+'M, ' + 
					't.'+data+'CV as t_'+data+'CV, r.'+data+'CV as r_'+data+'CV '+
				'FROM '+ meta.params.msa +'_'+ meta.params.scenario +'_input_tracts t, '+
					     meta.params.msa +'_'+ meta.params.scenario +'_output_regions r, '+
					     meta.params.msa +'_'+ meta.params.scenario +'_crosswalk c ' +
				'WHERE t.TID = c.TID AND r.RID = c.RID ' +
				'ORDER BY RID;';


	console.log(sql);

	// perform query
	this.db.query(sql, function (error, results, fields) {
		if (error) throw error;
		//console.log('results[0].TID: ', results[0].TID);

		meta.response = results;

		// send response
		meta.took = new Date()-timer;
		reply(meta);

	});



};





exports.get_MSA_scenario_TID = function(){
		if (request.params.tid) meta.params.tid = this.sanitizer.escape(request.params.tid);
		// simple query
	var sql = 'SELECT * FROM '+ this.db.escapeId(meta.params.msa +'_'+ meta.params.scenario +'_input_tracts') ;
};

