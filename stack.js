var AppStack = require( 'app-stack' )
  , cdAgent = require( 'cd-agent' )  
  , NRepeater = require( './layers/nrepeater.js' )
  , Executer = require( './layers/executer.js' )
  , Filter = require( './layers/filter.js' )
  , Splitter = require( './layers/splitter.js' );

function Stack(controller) {
  var app = new AppStack( function() { 
        return { controller: controller }; 
      } )
    , nRepeater = new NRepeater()
    , executer = new Executer()
    , filter = new Filter()
    , splitter = new Splitter()  
    , currentWorkingDir = process.cwd()
    , context = [];

  this.__defineGetter__('context', function() {
    return context;
  });

  this.__defineGetter__('cwd', function() { 
    return currentWorkingDir;
  });

  this.readdir = function(dir, done) {
    cdAgent({ 
        argv: ['cd'], 
        cwd: dir 
      }, done );
  };

  this.request = app.request;

  app.use( splitter.handle );
  app.use( filter.handle );
  app.use( /cd\s*.*/, changeDir ); 
  app.use( setDir );
  app.use( nRepeater.handle ); 
  app.use( executer.handle );

  function setDir(req, res) {
    req.cwd = currentWorkingDir; 
    res.end();
  }

  function changeDir(req, res) {
    cdAgent({ 
        argv: req.argv,
        cwd: currentWorkingDir
      }, 
      function(cwd, list) {
        delete req.argv;
        
        if (typeof cwd !== 'undefined') {
          res.cwd = cwd;
          currentWorkingDir = cwd;
        }
        if (typeof list !== 'undefined') {
          res.context = list;
          context = list;
        }
        res.end();
      });
  }
}

Stack.prototype = new AppStack(); 

module.exports = Stack; 
