/**
 *	routes.js: handle incoming paths
 */

'use strict';

var Handlers = require('./handlers/db_calls.js');

// export routes to server
module.exports = [
	{
		method: 'GET',						
		path: '/',
		handler: Handlers.root
	},{
		method: 'GET',
		path: '/api/{msa}/{scenario}/{data}',
		handler: Handlers.get_MSA_scenario_data
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







