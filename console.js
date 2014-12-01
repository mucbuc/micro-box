#!/usr/bin/env node

var readline = require( 'readline' );

function Console( controller ) {

	var rl = readline.createInterface( { 
		input: process.stdin, 
		output: process.stdout, 
	});

	rl.on( 'line', function(cmd) {
		stack.request( { params: cmd } );
	});

	rl.prompt( 'mb> ' );
	rl.resume();
}

if (!module.parent) {
	var events = require( 'events' )
	  , controller = new events.EventEmitter()
	  , Stack = require( './stack' )
	  , stack = new Stack( controller )
	  , c = new Console( controller );

	controller.on( 'feedback', function(msg) {
		console.log( msg );
	});



}
module.exports = Console; 

