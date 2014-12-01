#!/usr/bin/env node

function Console( controller ) {

}

if (!module.parent) {
	var events = require( 'events' )
	  , controller = new events.EventEmitter()
	  , Stack = require( './stack' )
	  , stack = new Stack( controller );

	controller.on( 'feedback', function(msg) {
		console.log( msg );
	});

	stack.request( 
		{ params: 'ls' }
	);

}
module.exports = Console; 

