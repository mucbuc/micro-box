var assert = require( 'assert' )
  , FlowStack = require( 'flow-troll' )
  , cdAgent = require( 'cd-agent' )  
  , NRepeater = require( './layers/nrepeater.js' )
  , Executer = require( './layers/executer.js' )
  , Filter = require( './layers/filter.js' )
  , Splitter = require( './layers/splitter.js' )
  , CWDManger = require( './layers/cwd.js' )
  , Tracker = require( './layers/history.js' )
  , Combiner = require( './layers/combiner.js' );

function Stack(controller) {
  var app = new FlowStack()
    , nRepeater = new NRepeater()
    , executer = new Executer()
    , filter = new Filter()
    , splitter = new Splitter()
    , cwdManger = new CWDManger()
    , tracker = new Tracker()
    , combiner = new Combiner();

  assert( typeof controller !== 'undefined' );

  this.__defineGetter__('cwd', function() { 
    return process.cwd();
  });

  this.request = app.process;

  app.use( function(o) { 
    assert( typeof o.input === 'string' );
    var input = { 
          params: o.input
        };

    o.controller = controller;
    o.next(); 
  });

  app.use( splitter.handle );
  app.use( filter.handle );
  app.use( /cd\s*.*/, cwdManger.changeDir );
  app.use( nRepeater.handle );
  app.use( tracker.handle ); 
  app.use( combiner.handle );
  app.use( executer.handle );
}

module.exports = Stack; 
