var AppStack = require( 'app-stack' )
  , cdAgent = require( 'cd-agent' )  
  , NRepeater = require( './layers/nrepeater.js' )
  , Executer = require( './layers/executer.js' )
  , Filter = require( './layers/filter.js' )
  , Splitter = require( './layers/splitter.js' )
  , CWDManger = require( './layers/cwd.js' )
  , Tracker = require( './layers/history.js' )
  , Combiner = require( './layers/combiner.js' );

function Stack(controller) {
  var app = new AppStack( function() { 
        return { controller: controller }; 
      } )
    , nRepeater = new NRepeater()
    , executer = new Executer()
    , filter = new Filter()
    , splitter = new Splitter()
    , cwdManger = new CWDManger()
    , tracker = new Tracker()
    , combiner = new Combiner();

  this.__defineGetter__('cwd', function() { 
    return process.cwd();
  });

  this.request = app.request;

  app.use( splitter.handle );
  app.use( filter.handle );
  app.use( /cd\s*.*/, cwdManger.changeDir );
  app.use( nRepeater.handle );
  app.use( tracker.handle ); 
  app.use( combiner.handle );
  app.use( executer.handle );
}

Stack.prototype = new AppStack(); 

module.exports = Stack; 
