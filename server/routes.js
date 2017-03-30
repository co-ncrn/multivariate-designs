/**
 *	routes.js: handle incoming paths
 */

'use strict';

var Handlers = require('./handlers/db_calls.js');

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
		//path: '/api/{msa}/{scenario}/{data}',
		path: '/{msa}/{scenario}/{data}',
		handler: Handlers.get_MSA_scenario_data
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



/*

	{
		method: 'GET',
		path: '/',
		handler: Handlers.root
	},{
		method: 'GET',
		path: '/test',
		handler: Handlers.test
	},{
		method: 'GET',
		path: '/count/{index?}',
		handler: Handlers.count
	},{
		method: 'GET',
		path: '/count/{top_left}/{bottom_right}',
		handler: Handlers.count_in_box
	},{
		method: 'GET',
		path: '/marker/{guid?}',
		handler: Handlers.marker
	},{
		method: 'GET',
		path: '/markers/{top_left}/{bottom_right}/{zoom}',
		handler: Handlers.markers
	},{
		method: 'GET',
		path: '/cluster/{top_left}/{bottom_right}/{zoom}',
		handler: Handlers.cluster
	},{
		method: 'POST',
		path: '/insert/{id}',
		handler: Handlers.insert
	}
*/	
];	







