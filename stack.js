var AppStack = require( 'app-stack' )
  , Layers = require( './layers' );

function Stack(controller) {
  var app = new AppStack( function() { 
        return { controller: controller }; 
      } ); 

  app.use( Layers.split );
  app.use( /cd\s*.*/, Layers.changeDir ); 
  app.use( Layers.filter );
  app.use( Layers.execute );

  this.request = app.request;
}

Stack.prototype = new AppStack(); 

module.exports = Stack; 
