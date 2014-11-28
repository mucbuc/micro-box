#!/usr/bin/env node

var readline = require( 'readline' )
  , emitStream = require( 'emit-stream' )
  , Stack = require( './stack' );

function Console( controller ) {
  var repl = readline.createInterface( {
        input: process.stdin,
        output: process.stdout
      }); 

  repl.setPrompt( 'mb> ' );
  repl.prompt();

  repl.on( 'line', function(cmd) {
    controller.emit( 'command', cmd );
  });   

  controller.on( 'done', function() {
    repl.prompt();
  });

  process.stdin.on( 'keypress', function(ch, key) {    
    if (typeof key !== 'undefined') {
      switch(key.name) {
        case 'tab': 
        controller.emit( 'autoComplete' );
        break;
      }  
    }
  });
}

if (!module.parent) {
  var events = require( 'events' )
    , controller = new events.EventEmitter()
    , stack = new Stack(controller)
    , c = new Console(controller);

  controller.on( 'command', function( cmd ) {
    stack.request( { params: cmd }, function(req, res) {
      controller.emit( 'done' );
    });
  });

}
else 
{
  module.exports = Console;
}

