var assert = require( 'assert' )
  , macros = require( './macros' );

function Completer() {

  var conext; 

  this.__defineGetter__('context', function() {
    return context;
  });

  this.__defineSetter__('context', function(val) {
    context = val;
  }); 

  this.complete = function(partial, callback) {
    var subContext = [];
    for(var property in macros) {
      var macro = macros[property];
      if (!partial.indexOf(property)) { 
        callback(null, [ [property + macro], partial ] );
        return;
      }
      else if (!property.indexOf(partial)) {
        subContext.push( property + macro );
      }
    }

    if (subContext.length) {
      callback(null, [ subContext, "git" ]);
      return;
    }

    if (!context.length) {
      callback(null, [[], end] );
    }
    else {
      searchContext();
    } 

    function searchContext() {

      var options = []
        , ind = getBeginIndex( partial )
        , end = partial.substr( ind + 1 );

      assert( partial.length ); 

      context.forEach( function( e, index, array ) {
        if (e.indexOf(end) == 0) {
          options.push( e );
        }

        if (index === array.length - 1) {
          callback(null, [options, end] );
        }
      } );
    }

    function getBeginIndex( command ) {
      var a = command.lastIndexOf( ' ' )
        , b = command.lastIndexOf( '/' );
      return b > a ? b : a;
    }
  };
}

module.exports = Completer;