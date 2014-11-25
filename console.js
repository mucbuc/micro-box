#!/usr/bin/env node

var repl = require( 'repl' )
  , splitargs = require( 'splitargs' )
  , emitStream = require( 'emit-stream' );

if (!module.parent) {
  var events = require( 'events' )
    , CD_Agent = require( 'cd-agent' )
    , AppStack = require( 'app-stack' )
    , logger = require( './logger.js')
    , controller = new events.EventEmitter()
    , app = new AppStack( controller )
    , agent = new CD_Agent( controller )
    , cwd = process.cwd()
    , context = [];

  controller.on( 'command', function( cmd ) {
    app.request( cmd );
    controller.emit( 'done' );
  } );

  app.use( split );
  app.use( logger );
  app.use( /cd\s+.*/, changeDir ); 

  repl.start( { 
    eval: function( cmd, context, filename, callback ) {
      app.request( cmd.slice( 1, -2 ) );
      callback(null, 0);
    }
  } );

  function split(params, res) {
    res.argv = splitargs(params);
    res.end();
  }

  function changeDir(params, req) {
    controller.once( 'cwd', function(next) {
      cwd = next;
      console.log( 'cwd: ', cwd );
    });

    controller.once( 'ls', function(list) {
      context = list;
    });

    agent.process(req.argv, cwd);
  }
}

