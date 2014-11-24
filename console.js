#!/usr/bin/env node

var repl = require( 'repl' )
  , emitStream = require( 'emit-stream' );

function readInput( req, res ) {
	if (!req.length) {
		repl.start( { 
			eval: function( cmd, context, filename, callback ) {
				res.controller.once( 'done', function() {
					callback(null, 0);
				});
				res.controller.emit( 'command', cmd.slice( 1, -2 ) );
				res.end();
			}
		} );
	}
	else {
		res.end();
	}
}

if (!module.parent) {
	var events = require( 'events' )
      , controller = new events.EventEmitter()
	  , AppStack = require( 'app-stack' )
	  , logger = require( './logger.js')
	  , app = new AppStack( controller );

	controller.on( 'command', function( cmd ) {
		app.request( cmd );
		controller.emit( 'done' );
	} );

	app.use( readInput );
	app.use( /hey.*/, logger );
	app.request( '' ); 
}

