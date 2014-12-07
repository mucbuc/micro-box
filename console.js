#!/usr/bin/env node

var assert = require( 'assert' )
  , readline = require( 'readline' )
  , Stack = require( './stack' )
  , events = require( 'events' )
  , stream = require( 'stream' );

function Console() {

  var writer = process.stdout.write
    , outBuffer = ''
    , stack = new Stack( controller )
    , context
    , cwd; 

  stack.request( { params: 'cd' }, function(req, res) {
    if (res.hasOwnProperty('context')) {
      context = res.context; 
      cwd = res.cwd;
    }
  } );
  
  process.stdout.write = function() {
    outBuffer += arguments[0].toString();
    return writer.apply(this, arguments); 
  };

  var rl = readline.createInterface( { 
    input: process.stdin, 
    output: process.stdout,
    completer: function(partial, callback) {
      
      assert( outBuffer.length ); 

      var options = []
        , ind = getBeginIndex( outBuffer )
        , end = outBuffer.substr( ind + 1 );

      context.forEach( function( e, index, array ) {
            if (e.indexOf(end) == 0) {
              options.push( e );
            }

            if (index === array.length - 1) {
              
              if (options.length === 1) {
                cwd += '/' + options[0];
              }
              callback(null, [options, end] );
            }
      } );

      if (!context.length) {
        callback(null, [[], end] );
      }
      
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

  process.stdin.on( 'keypress', function( ch, key ) {
    if (ch === '/') {
      stack.readdir( cwd, function(cwd, list) {
        context = list;
      } );
    }
  });

  read();

  function read() {
    rl.setPrompt( stack.cwd + '> ' );
    rl.prompt();
  }
}

if (!module.parent) {
  var events = require( 'events' )
    , controller = new events.EventEmitter()
    , c = new Console( controller );
}

module.exports = Console; 

