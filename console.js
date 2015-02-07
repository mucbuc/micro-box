#!/usr/bin/env node

var assert = require( 'assert' )
  , readline = require( 'readline' )
  , Stack = require( './stack' )
  , events = require( 'events' )
  , stream = require( 'stream' )
  , fs = require( 'fs' )
  , Completer = require( './completer' );

function Console() {

  var controller = new events.EventEmitter()
    , stack = new Stack( controller )
    , completer = new Completer()
    , cwd = process.cwd()
    , rl
    , repeat = '';

  rl = readline.createInterface( { 
    input: process.stdin, 
    output: process.stdout,
    completer: completer.complete
  });

  rl.on( 'line', function(cmd) {
    stack.request( { 
      params: repeat + cmd 
    }, 
    read );
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
    , c = new Console();
}

module.exports = Console; 

