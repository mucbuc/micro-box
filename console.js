#!/usr/bin/env node

var repl = require( 'repl' )
  , Stack = require( './stack' );

if (!module.parent) {
  var events = require( 'events' )
    , controller = new events.EventEmitter()
    , stack = new Stack(controller);

  controller.on( 'command', function( cmd ) {
    stack.request( cmd );
    controller.emit( 'done' );
  } );

  repl.start( { 
    eval: function( cmd, context, filename, callback ) {
      stack.request( cmd.slice( 1, -2 ) );
      callback(null, 0);
    }
  } );
}

