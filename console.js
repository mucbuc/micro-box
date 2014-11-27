#!/usr/bin/env node

var readline = require( 'readline' )
  , emitStream = require( 'emit-stream' )
  , Stack = require( './stack' );

function Console( controller, stdin, stdout ) {
  var repl = readline.createInterface( {
        input: stdin,
        output: stdout
      }); 

  repl.setPrompt( 'mb> ' );
  repl.prompt();

  repl.on( 'line', function(cmd) {
    controller.once( 'done', function() {
      repl.prompt();
    });
    controller.emit( 'command', cmd );
  });   

  stdin.on( 'keypress', function(ch, key) {    
    if (typeof key !== 'undefined') {
      switch(key.name) {
        case 'tab': 
        console.log( 'tab' );
        break;
      }  
    }
  });
}


if (!module.parent) {
  var events = require( 'events' )
    , controller = new events.EventEmitter()
    , stack = new Stack(controller)
    , c = new Console( controller, process.stdin, process.stdout );

  controller.on( 'command', function( cmd ) {
    stack.request( cmd, function(param, res) {
      controller.emit( 'done' ); 
    });
  });

  
}
else 
{
  module.exports = Console;
}

