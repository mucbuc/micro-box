var AppStack = require( 'app-stack' )
  , CDAgent = require( 'cd-agent' )
  , Layers = require( './layers' );

function Stack(controller) {
  var app = new AppStack( function() { 
        return { controller: controller }; 
      } )
    , cd_agent = new CDAgent()
    , currentWorkingDir = process.cwd(); 

  app.use( Layers.split );
  app.use( /cd\s*.*/, function(req, res) {
    cd_agent.eval( req.argv, function(cwd, list) {
      delete req.argv;
      if (typeof cwd !== 'undefined') {
        res.cwd = cwd;
        currentWorkingDir = cwd;
      }
      if (typeof list !== 'undefined') {
        res.context = list;
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
