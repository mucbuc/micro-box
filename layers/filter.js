var assert = require( 'assert' ) 
  , config = require( '../config.json' );  

assert( typeof config !== 'undefined' );

function Filter() {
  this.handle = function(o) {

    var tmp; 
    for (var r in config.sandbox) {
      var re = new RegExp( config.sandbox[r] );
      if (re.test(o.input)) {
        o.next();
        return;
      }
    }
    process.stdout.write( "'" + o.argv[0] + "' is blocked\n" ); 
    delete o.argv;
    o.next();
  };
}

module.exports = Filter;