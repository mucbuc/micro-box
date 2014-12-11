#!/usr/bin/env node

var assert = require( 'assert' )
  , readline = require( 'readline' )
  , Stack = require( './stack' )
  , events = require( 'events' )
  , stream = require( 'stream' )
  , macros = require( './macros' )
  , fs = require( 'fs' );

console.log( macros ); 

function Console() {

  var writer = process.stdout.write
    , stack = new Stack( controller )
    , context
    , cwd
    , repeat = '';

  stack.request( { params: 'cd' }, function(req, res) {
    if (res.hasOwnProperty('context')) {
      context = res.context; 
      cwd = res.cwd;
    }
  } );

  var rl = readline.createInterface( { 
    input: process.stdin, 
    output: process.stdout,
    completer: function(partial, callback) {

      var done = false;

      assert( partial.length ); 

      for(var property in macros) {
        var macro = macros[property];
        if (!partial.indexOf(property)) { 
          callback(null, [ [property + macro], partial ] );
          return;
        }
      }

      if (!context.length) {
        callback(null, [[], end] );
      }
      else {
        searchContext();
      } 

      function searchContext() {

        var options = []
          , ind = getBeginIndex( partial )
          , end = partial.substr( ind + 1 );

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
      params: repeat + cmd 
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

  function read(req, res) {
    var base = stack.cwd + '> ';
    rl.setPrompt( base );
    rl.prompt();

    if (typeof res !== 'undefined' && res.hasOwnProperty('repeat')) {
      rl.write( res.repeat );
    }
  }
}

if (!module.parent) {
  var events = require( 'events' )
    , controller = new events.EventEmitter()
    , c = new Console( controller );
}

module.exports = Console; 

