#!/usr/bin/env node

var assert = require( 'assert' ) 
  , Stack = require( './stack' )
  , events = require( 'events' );

suite( 'micro-box', function() {
	test( 'cwd', function() {

		var controller = new events.EventEmitter()
		  , stack = new Stack(controller);

		controller.on( 'feedback', function(txt){
			console.log(txt);
		});

		stack.request( { params: 'ls' } );
		
	});
}); 