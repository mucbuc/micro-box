var assert = require( 'assert' )
  , fs = require( 'fs' )
  , cdAgent = require( 'cd-agent' )
  , cp = require( 'child_process' );

function Completer() {

  this.complete = function(partial, callback) {
    var context = [];

    fs.readFile( './macros.json', function(error, data) {
      if (error) throw error;

      tryMatchMacros(JSON.parse(data.toString()));
    });

    function tryMatchMacros(macros) {
      for(var property in macros) {
        var macro = macros[property]
          , command = property + macro;
        if (    partial.length > property.length 
            &&  (   !property.indexOf(partial)
                ||  !command.indexOf(partial))) { 
          if (macro.indexOf('#BRANCH_NAME') != -1) {
            cp.exec( 'git rev-parse --abbrev-ref HEAD', function( err, stdout ) {
              var branch = stdout.toString().slice(0, -1);
              if (err) throw err; 
              command = property + macro.replace( '#BRANCH_NAME', branch );
              command += ' ';            
              callback(null, [ [command], partial ] );
            });
          }
          else {
            callback(null, [ [command], partial ] );
          }
          return;
        }
        else if (!property.indexOf(partial)) {
          context.push( command );
        }
      }

      // this is messy
      if (context.length) {
        callback(null, [ context, partial ]);
        return;
      }
      
      searchPath();
    }

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