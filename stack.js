var AppStack = require( 'app-stack' )
  , cdAgent = require( 'cd-agent' )
  , Layers = require( './layers' );

function Stack(controller) {
  var app = new AppStack( function() { 
        return { controller: controller }; 
      } )
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

  app.use( Layers.split );
  app.use( Layers.filter );
  app.use( /cd\s*.*/, changeDir ); 
  app.use( setDir );
  app.use( Layers.nRepeater ); 
  app.use( Layers.execute );


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
