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

  app.use( Layers.split );
  app.use( /cd\s*.*/, function(req, res) {
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
  }); 
  app.use( Layers.filter );
  app.use( function(req, res) {
    req.cwd = currentWorkingDir; 
    res.end();
  });
  app.use( Layers.execute );

  this.request = app.request;
}

Stack.prototype = new AppStack(); 

module.exports = Stack; 
