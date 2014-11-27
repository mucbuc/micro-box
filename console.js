#!/usr/bin/env node

var repl = require( 'repl' )
  , Stack = require( './stack' );

if (!module.parent) {
  var events = require( 'events' )
    , controller = new events.EventEmitter()
    , stack = new Stack(controller);

  repl.start( { 
    eval: function( cmd, context, filename, callback ) {
      var command = cmd.slice( 1, -2 );
      if (command.length) {
        stack.request( command, function(params, res) {
          callback(0, null);
        });
      } 
      else {
        callback(0, null);
      }
    }
  } );
}

