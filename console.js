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
    , cwd = process.cwd()
    , rl
    , repeat = '';

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
      fs.readdir( cwd, function(err, files) {
        if (err) throw err;
        completer.context = files;
      });
    }
  });

  read();

  function read(req, res) {
    var base = process.cwd() + '> ';
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

