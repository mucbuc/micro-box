#!/usr/bin/env node

var assert = require( 'assert' )
  , net = require( 'net' )
  , events = require( 'events' )
  , Console = require( './console' ); 

assert( typeof Console === 'function' );

function Client() {
	var emitter = new events.EventEmitter()
	  , c = new Console( emitter ); 

	emitter.on( 'command', function( cmd ) { 
		var client = net.connect( { port: '3000' } );
 		client.write( cmd );
		client.once( 'data', function(data) {
			emitter.emit( 'exit', data ); 
			client.end();
		} );
	});
}

if (!module.parent) {
	var c = new Client(); 
}