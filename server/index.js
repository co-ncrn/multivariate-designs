


/*

accept calls
	get all data for an MSA + scenario
		https://domain.com/api/msa/10180/gen/
		https://domain.com/api/msa/{msa}/{scenario}/

	get all data for a tract
		https://domain.com/api/tract/g48441012300/gen/
		https://domain.com/api/tract/{tid}/{scenario}/

join the correct tables
	10180_gen_crosswalk
	10180_gen_input_tracts
	10180_gen_output_regions

reply
	{ }

*/




const Hapi = require('hapi');		// load hapi module
const server = new Hapi.Server();	// create hapi server object
server.connection ({ port:4000 });	// connect server to port

/*
// mysql
// source: https://github.com/felixge/node-mysql
var mysql_keys = require('./inc/mysql_keys'); // sensitive
var mysql = require('mysql');
var db = mysql.createConnection({
	host     : mysql_keys.host,
    port	 : 3306,
	user     : mysql_keys.user,
	password : mysql_keys.password,
	//database : 'stinky2_db_utf8', // !!!!!!!
	database : mysql_keys.database,
	charset	 : 'utf8mb4',
    acquireTimeout: 10000000,
    multipleStatements: true
});
db.connect();
// test for error
db.on('error', function(err) {
	console.log(err.code); // 'ER_BAD_DB_ERROR'
	console.error("DATABASE ERRRORRRRRRR");
	db.connect();
});

*/

// require routes
server.route(require('./routes'));



server.register({								// first arg to server.register() is a plugin config object
	register: require('good'),					// load 'good' module as register option
	options: {									// options object for plugin
		reporters: [{							// specify range of reporters
			reporter: require('good-console'),	// load good-console module as a reporter option
			events: { response: '*' }			// specify that reporter report all response events
		}]
	}
}, (err) => {									// second arg to server.register() is a callback
	if (err) throw err;							// check for error registering the plugin

	server.start((err) => {
		if (err) throw err;						// check for error registering the plugin
		console.log('Server running at: ', server.info.uri);
	});
});