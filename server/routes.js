/**
 *	routes.js: handle incoming paths
 */

'use strict';

//var Handlers = require('./handlers/es_calls.js');

// export routes to server
module.exports = [
	{
		method: 'GET',						
		path: '/',
		handler: function (request,reply){
			reply('Hello World');
		}
	},{
		method: 'GET',
		path: '/json',
		handler: function(request,reply){
			reply({ hello: "World" });
		}
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







