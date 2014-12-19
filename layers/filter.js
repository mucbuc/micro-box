var assert = require( 'assert' ) 
  , config = require( '../config.json' );  

assert( typeof config !== 'undefined' );

function Filter() {
  this.handle = function( req, res ) {
    var tmp; 
    for (var r in config.sandbox) {
      var re = new RegExp( config.sandbox[r] );
      if (re.test(req.params)) {
        res.end();
        return;
      }
    }
    process.stdout.write( "'" + req.argv[0] + "' is blocked\n" ); 
    delete req.argv;
    res.end();
  };
}

module.exports = Filter;