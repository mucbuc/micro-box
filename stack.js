var assert = require( 'assert' )
  , FlowStack = require( 'flow-troll' )
  , cdAgent = require( 'cd-agent' )  
  , NRepeater = require( './layers/nrepeater.js' )
  , Executor = require( './layers/executor.js' )
  , Filter = require( './layers/filter.js' )
  , Splitter = require( './layers/splitter.js' )
  , CWDManger = require( './layers/cwd.js' )
  , Tracker = require( './layers/history.js' )
  , Combiner = require( './layers/combiner.js' )
  , MacroMaker = require( './layers/macromaker.js' )
  , config = require( './config.json' );

assert( typeof config !== 'undefined' );

function Stack(controller) {
  var app = new FlowStack()
    , nRepeater = new NRepeater()
    , executor = new Executor()
    , filter = new Filter()
    , splitter = new Splitter()
    , cwdManger = new CWDManger()
    , tracker = new Tracker()
    , combiner = new Combiner()
    , macromaker = new MacroMaker;;

  assert( typeof controller !== 'undefined' );

  this.__defineGetter__('cwd', function() { 
    return process.cwd();
  });

  this.request = app.process;

  app.use( function(o) {
    o.controller = controller;
    o.stdout = process.stdout;
    o.next(o);
  });
  
  app.use( splitter.handle );
  app.use( filter.handle );
  app.use( /cd\s*.*/, cwdManger.changeDir );
  app.use( nRepeater.handle );
  app.use( tracker.handle ); 
  app.use( combiner.handle );

  app.use( function(o) {
    process.stdin.pause(); 
    process.stdin.setRawMode( false );
    o.next(); 
  });

  app.use( executor.handle );

  app.use( function(o) {
    process.stdin.resume(); 
    process.stdin.setRawMode( true ); 
    process.stdout.write( process.cwd() ); 
    o.next(); 
  });

  if (config.hasOwnProperty('makeMacro')) {
    app.use( new RegExp( config.makeMacro ), macromaker.handle );
  }
}

module.exports = Stack; 
