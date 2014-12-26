var assert = require( 'assert' )
  , macros = require( './macros' )
  , fs = require( 'fs' )
  , cdAgent = require( 'cd-agent' );

function Completer() {

  this.complete = function(partial, callback) {
    var context = [];
    for(var property in macros) {
      var macro = macros[property];
      if (!partial.indexOf(property)) { 
        if (false && macro.indexOf('#BRANCH_NAME') != -1) {
          var branch = require('git-branch');
          macro = macro.replace( '#BRANCH_NAME', branch )
        }
        else {
          console.log( require('git-branch') );
        }
        callback(null, [ [property + macro], partial ] );
        return;
      }
      else if (!property.indexOf(partial)) {
        context.push( property + macro );
      }
    }
    
    if (context.length) {
      callback(null, [ context, partial ]);
      return;
    }
    
    searchPath();
    function searchPath() {

      var lookAheadDir = ''
        , separatorIndex = partial.lastIndexOf( '/' )
        , spaceIndex = partial.lastIndexOf( ' ' )
        , rel;

      assert( partial.length ); 

      if (    separatorIndex != -1 
          &&  separatorIndex > spaceIndex) {
        lookAheadDir = partial.substr(spaceIndex + 1, separatorIndex - spaceIndex);
        rel = partial.substr( separatorIndex + 1);
      }
      else {
        rel = partial.substr( spaceIndex + 1);
      }

      cdAgent({
          argv: [ 'cd', lookAheadDir ]
        }, function(cwd, files) { 
          var options = [];
          if (    typeof files === 'undefined'
              ||  !files.length) {
            callback(null, [options, rel] );
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