
/**
 *	Regionalization Server
 *	@requires: node, npm, etc.
 *	@use: forever to run https://github.com/foreverjs/forever
 *	$ forever start index.js
 *	on reboot: http://stackoverflow.com/a/21847976/441878
 */
'use strict';
var os = require('os'); os.tmpDir = os.tmpdir;	// hide annoying mac error





const fs = require('./inc/functions.js');	// include functions file
const memwatch = require('memwatch-next');	// watch for memory leaks
const sanitizer = require('sanitizer');		// sanitize input https://www.npmjs.com/package/sanitizer
const validator = require('validator');		// validate input https://www.npmjs.com/package/validator
const Boom = require('boom');				// HTTP-friendly error objects https://github.com/hapijs/boom


const Netmask = require('netmask').Netmask;


const Hapi = require('hapi');		// load hapi server module
const server = new Hapi.Server();	// create hapi server object

// create server connection
server.connection({
	host : 'localhost',
	port: 3000,
  	routes: {
		cors: {
			origin: ['*']
		}
	}
});

// mysql
// source: https://github.com/mysqljs/mysql
const mysql_keys = require('./inc/mysql_keys'); // sensitive
const mysql = require('mysql');
const db = mysql.createConnection({
	host     : mysql_keys.host,
    port	 : 3306,
	user     : mysql_keys.user,
	password : mysql_keys.password,
	database : mysql_keys.database,
	charset	 : 'utf8mb4',
    acquireTimeout: 10000000,
    multipleStatements: true
});
db.connect();						// connect to db
db.on('error', function(err) {		// test for error
	console.log(err.code); 		
	console.error("DATABASE ERRRORRRRRRR");
	db.connect();
});

// server binding ** call before routes! **
server.bind({  
	Boom: Boom,
	db: db, 				// bind db connection to server
	Sanitizer: sanitizer, 	// bind sanitizer to server
	Validator: validator, 	// bind validator to server
	fs: fs 					// bind functions to server
});			







// list of blocked IP/subnets
// get more:
// http://www.wizcrafts.net/iptables-blocklists.html
const blacklist = [
	'80.82.70.0'
//	'127.0.0.1' // me/test
];
const blockIPs = function (request,reply){		// define extension function
	const ip = request.info.remoteAddress;		// get client's IP
	console.log("client ip: ",ip);
	for (let i=0; i < blacklist.length; ++i){	// check each subnet in blacklist
		const block = new Netmask(blacklist[i]);
		if (block.contains(ip)){				// check if client IP is within blocked subnet
			console.log('Blocking request from ' + ip + '. Within blocked subnet ' + blacklist[i]);
			return reply(Boom.forbidden());		// set response to Boom.forbidden() (403) error,
		}										// 	hand control back to hapi
	}
	reply.continue();							// if client IP doesn't match any blocked subnet,
}												//	hand control back to hapi, proceed as normal 
server.ext('onRequest', blockIPs);				// attach blockIPs function to the onRequest extension point






server.register([{								// first arg to server.register() is array to register plugins
	register: require('good'),					// load 'good' module as register option
	options: {									// options object for plugin
		reporters: [{							// specify range of reporters
			reporter: require('good-console'),	// load good-console module as a reporter option
			events: { response: '*' }			// specify that reporter report all response events
		}]
	}
}/*,{
	register: require('./plugins/globals')
}*/], (err) => {									// second arg to server.register() is a callback
	if (err) throw err;							// check for error registering the plugin(s)

	server.route(require('./routes'));			// require routes (after binds, methods, etc.)
	server.start((err) => {
		if (err) throw err;						// check for error starting the server
		console.log('Server running at: ', server.info.uri);
	});
});


