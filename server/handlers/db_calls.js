/**
 *	db_calls.js: handle requests from routes.js
 */



/** 
 * 	root / status check
 *	TEST: http://localhost:3000/
 */
exports.root = function (request, reply) {
	var timer = new Date();
	var meta = {
		request: "/",
		status: "ok",
		took: new Date()-timer
	};	
	reply(meta);
};

/** 
 * 	get all data for an MSA + scenario
 *	TEST: 
 *		http://localhost:3000/msa/10180/gen/
 *		http://localhost:3000/msa/{msa}/{scenario}/
 */
exports.test = function(request, reply) {
	var timer = new Date();
	var params = {}; 

	if (request.params) // if index supplied
		params = { msa: request.params.msa }

	console.log(params);

	var meta = {
		request: "test",
		msa: request.params.msa
	};


	if (!isNaN(request.params.msa)){
		console.log(request.params.msa + " is a number")
		


		var sql = 'SELECT * FROM '+ params.msa +'_gen_input_tracts';
		//console.log(sql);

		this.db.query(sql, function (error, results, fields) {
			if (error) throw error;


			console.log('results[0].TID: ', results[0].TID);
				
			meta.response = 'results[0].TID: '+ results[0].TID;
			meta.took = new Date()-timer;

			reply(meta);
		});

	} else {
		meta.response = 'That is not a valid MSA';
		meta.took = new Date()-timer;
		reply(meta);
	}

	/*
	if (request.params.index) // if index supplied
		params = { index: request.params.index }
	this.es.count(params, function (error, response, status) {
		if (error) reply(error); // handle error, build reply
		var meta = {
			request: "count",
			index: request.params.index,
			count:response.count,
			took: new Date()-timer
		};	
		reply(meta);
	});
	*/
};


