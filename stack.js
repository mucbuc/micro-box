var AppStack = require( 'app-stack' )
  , CDAgent = require( 'cd-agent' )
  , Layers = require( './layers' );

function Stack(controller) {
  var app = new AppStack( function() { 
        return { controller: controller }; 
      } )
    , cd_agent = new CDAgent(); 

  app.use( Layers.split );
  app.use( /cd\s*.*/, function(req, res) {
    cd_agent.eval( res.argv, function(cwd, list) {
      delete res.argv;
      if (typeof cwd !== 'undefined') {
        req.cwd = cwd;
      }
      if (typeof list !== 'undefined') {
        req.context = list;
      }
      res.end();
    });
  }); 
  app.use( Layers.filter );
  app.use( Layers.execute );

  this.request = app.request;
}

Stack.prototype = new AppStack(); 

module.exports = Stack; 
