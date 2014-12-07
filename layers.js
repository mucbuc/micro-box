var assert = require( 'assert' ) 
  , config = require( './config.json' )
  , splitargs = require( 'splitargs' )
  , cp = require( 'child_process' )
  , previous = ''
  , repeaterEnd = 0;

var Layers = {

  nRepeater: function(req, res) { 
    
    if (previous.length) {
      var d = findDiff(previous, req.params);
      if (d > 0) {
        res.repeat = previous.substr(0, d);
      }
    }
    previous = req.params;
    
    res.end();

    function findDiff(lhs, rhs) {
      var index = 0;
      while (   index < rhs.length 
            &&  index < lhs.length
            &&  rhs.charAt(index) == lhs.charAt(index)) 
      {
        ++index;
      }
      return index;
    } 
  },

  execute: function(req, res) {

    var command = ''
      , argv = []
      , child;
      
    if (req.hasOwnProperty('argv') && req.argv.length) {
      command = req.argv[0];
      if (req.argv.length > 1) {
        argv = req.argv.splice(1);
      }
      spawn();
    }
    else {
      res.end();
    }

    function spawn() {

      process.stdin.pause(); 
      process.stdin.setRawMode( false );

      child = cp.spawn(
        command, 
        argv, 
        { 
          stdio: 'inherit',
          cwd: req.cwd
        });

      child.once( 'exit', function(code, signal) {
        process.stdin.resume();
        process.stdin.setRawMode( true );
        res.end();
        res.controller.emit( 'exit', code, signal );
      });
    }
  },

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