/**
 *	routes.js: handle incoming paths
 */

'use strict';

const Handlers = require('./handlers/db_calls.js');


// export routes to server
module.exports = [
	{
		// root / test
		method: 'GET',		
		path: '/',
		handler: Handlers.root
	},{
		// get all msa data
		method: 'GET',
		//path: '/api/{msa}/{scenario}/{data}', // original path, before server config
		path: '/{msa}/{scenario}/{data}',
		handler: Handlers.get_MSA_scenario_data,
		config: {
			cache: {
				privacy: 'private',
				expiresIn: 86400 * 1000
			}
		}
	},{
		// get _metadata for menus
		method: 'GET',
		//path: '/api/_metadata/{msa?}',
		path: '/_metadata/{msa?}',
		handler: Handlers.get_metadata
	},{
		// may not need to reference API with Apache/PHP proxy pointing @ /api
		/*
		// catch alls 
		method: 'GET',
		path: '/api/{path*}',
		handler: Handlers.catchAll_api
	},{*/
		// default
		method: 'GET',
		path: '/{path*}',
		handler: Handlers.catchAll
	}


];	







