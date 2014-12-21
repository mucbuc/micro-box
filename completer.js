var assert = require( 'assert' )
  , macros = require( './macros' )
  , fs = require( 'fs' )
  , path = require( 'path' );

function Completer() {

  this.complete = function(partial, callback) {
    var context = [];
    for(var property in macros) {
      var macro = macros[property];
      if (!partial.indexOf(property)) { 
        callback(null, [ [property + macro], partial ] );
        return;
      }
      else if (!property.indexOf(partial)) {
        context.push( property + macro );
      }
    }
    
    if (context.length) {
      console.log( 'context: ', context );
      callback(null, [ context, partial ]);
      return;
    }
    
    searchPath();
    function searchPath() {

      var lookAheadDir = process.cwd()
        , separatorIndex = partial.lastIndexOf( '/' )
        , spaceIndex = partial.lastIndexOf( ' ' )
        , rel;

      assert( partial.length ); 

      if (    separatorIndex != -1 
          &&  separatorIndex > spaceIndex) {
        var t = partial.substr(spaceIndex + 1, separatorIndex - spaceIndex);
        lookAheadDir = path.join( lookAheadDir, t );
        rel = partial.substr( separatorIndex + 1);
      }
      else {
        rel = partial.substr( spaceIndex + 1);
      }
      
      fs.readdir( lookAheadDir, function( err, files ) {
        var options = [];
        if (err) throw err;
        if (!files.length) {
          callback(null, [[], rel] );
          return;
        }

        files.forEach( function( e, index, array ) {
          if (e.indexOf(rel) == 0) {
            options.push( e );
          }

          if (index === array.length - 1) {
            callback(null, [options, rel] );
          }
        } );
      }); 
    }
  };
}

module.exports = Completer;