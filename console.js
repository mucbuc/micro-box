#!/usr/bin/env node

var readline = require( 'readline' );

function Console() {

	var rl = readline.createInterface( { 
		input: process.stdin, 
		output: process.stdout,
		completer: function(partial, callback) {
			var options = []
			  , ind = getBeginIndex( partial )
	          , options = []
	          , end = partial.substr( ind + 1 );

			stack.context.forEach( function( e, index, array ) {
		        if (e.indexOf(end) == 0) {
		        	options.push( e );
		        }

		        if (index === array.length - 1) {
		        	callback(null, [options, end] );
		        }
			} );

			function getBeginIndex( command ) {
		    	var a = command.lastIndexOf( ' ' )
		          , b = command.lastIndexOf( '/' );

		      	return b > a ? b : a;
		    }
  		}
	});

	rl.on( 'line', function(cmd) {
		stack.request( { 
			params: cmd 
		}, 
		read );
	});

	read();

	function read() {
		rl.prompt( 'mb> ' );
		rl.resume();
	}
}

if (!module.parent) {
	var events = require( 'events' )
	  , controller = new events.EventEmitter()
	  , Stack = require( './stack' )
	  , stack = new Stack( controller )
	  , c = new Console( controller );

	stack.request( { params: 'cd' }, function(req, res) {
		if (res.hasOwnProperty('context')) {
			stack.context = res.context; 
		}
	} );

	controller.on( 'feedback', function(msg) {
		console.log( msg );
	});



}
module.exports = Console; 

