var assert = require( 'assert' ) 
  , config = require( './config.json' )
  , splitargs = require( 'splitargs' )
  , cp = require( 'child_process' );

var Layers = { 
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
          stdio: [ process.stdin, 'pipe', 'pipe' ],
          cwd: req.cwd
        });

      //res.controller.on( 'evaluate', write );
      //res.controller.on( 'kill', kill );

      child.stdout.on( 'data', feedback ); 
      child.stderr.on( 'data', feedback );

      child.once( 'exit', function(code, signal) {
        process.stdin.resume();
        process.stdin.setRawMode( true );
        res.end();
        res.controller.emit( 'exit', code, signal );
      });

      function kill() { 
        child.kill();
      }

      function write(cwd, data) {
        child.stdin.write( data.toString() + '\n' ); 
      }

      function feedback(data) {
        res.controller.emit( 'feedback', data.toString() );
      }
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
    res.controller.emit( 'feedback', "'" + req.argv[0] + "' is blocked\n" );
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