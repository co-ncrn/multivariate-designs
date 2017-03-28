
/**
 *	Regionalization Server
 *	@requires: node, npm, etc.
 *	@use: forever to run https://github.com/foreverjs/forever
 *	$ forever start index.js
 *	on reboot: http://stackoverflow.com/a/21847976/441878
 */
'use strict';

const fs = require('./inc/functions.js');	// include functions file
const memwatch = require('memwatch-next');// watch for memory leaks
const sanitizer = require('sanitizer');	// sanitize input https://www.npmjs.com/package/sanitizer
const validator = require('validator');	// validate input https://www.npmjs.com/package/validator

const Boom = require('boom');
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
	db: db, 				// bind db connection to server
	sanitizer: sanitizer, 	// bind sanitizer to server
	validator: validator, 	// bind validator to server
	fs: fs 				// bind functions to server
});			

server.route(require('./routes'));	// require routes (after binds, methods, etc.)


// list of blocked subnets
const blacklist = [
	'80.82.70.0',
	'127.0.0.1'
];
const blockIPs = function (request,reply){
	const ip = request.info.remoteAddress;		// get client's ip
	console.log("client ip: ",ip);
	for (let i=0; i < blacklist.length; ++i){
		const block = new Netmask(blacklist[i]);
		if (block.contains(ip)){
			console.log('Blocking request from ' + ip + '. Within blocked subnet ' + blacklist[i]);
			return reply(Boom.forbidden());
		}
	}
	reply.continue();
}
server.ext('onRequest', blockIPs);



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
		if (err) throw err;						// check for error starting the server
		console.log('Server running at: ', server.info.uri);
	});
});


