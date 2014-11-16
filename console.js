#!/usr/bin/env node

var repl = require( 'repl' )
  , emitStream = require( 'emit-stream' );

function Console( controller ) {
	repl.start( { 
		eval: function( cmd, context, filename, callback ) {
			controller.emit( 'command', cmd.slice( 1, -2 ) ); 
			controller.once( 'exit', function( data ) {
				callback( data.toString(), 0 ); 
			} ); 
		}
	} );
}

if (!module.parent) {
	var events = require( 'events' )
	  , Logic = require( './logic' )
	  , emitter = emitStream( new events.EventEmitter() )
	  , c = new Console( emitter )
	  , l = new Logic( emitter ); 
}
module.exports = Console; 

