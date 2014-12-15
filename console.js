#!/usr/bin/env node

var assert = require( 'assert' )
  , readline = require( 'readline' )
  , Stack = require( './stack' )
  , events = require( 'events' )
  , stream = require( 'stream' )
  , fs = require( 'fs' )
  , Completer = require( './completer' );

function Console() {

  var stack = new Stack( controller )
    , completer = new Completer()
    , cwd
    , rl
    , repeat = '';

  stack.request( { params: 'cd' }, function(req, res) {
    if (res.hasOwnProperty('context')) {
      completer.context = res.context; 
      cwd = res.cwd;
    }
  } );

  rl = readline.createInterface( { 
    input: process.stdin, 
    output: process.stdout,
    completer: completer.complete
  } );

  rl.on( 'line', function(cmd) {
    stack.request( { 
      params: repeat + cmd 
    }, 
    read );
  });

  process.stdin.on( 'keypress', function( ch, key ) {
    if (ch === '/') {
      stack.readdir( cwd, function(cwd, list) {
        completer.context = list;
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

