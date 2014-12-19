var assert = require( 'assert' ) 
  , config = require( './config.json' )
  , splitargs = require( 'splitargs' )
  , cp = require( 'child_process' )
  , NRepeater = require( './layers/nrepeater.js' )
  , Executer = require( './layers/executer.js' )
  , repeaterEnd = 0
  , nrep = new NRepeater()
  , exe = new Executer(); 

var Layers = {

  nRepeater: nrep.handle, 
  execute: exe.handle,

  filter: function( req, res ) {
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
  },

  split: function(req, res) {
    assert( req.hasOwnProperty( 'params' ) );
    req.argv = splitargs(req.params);
    res.end();
  }
};

module.exports = Layers;