var assert = require( 'assert' ) 
  , AppStack = require( 'app-stack' )
  , logger = require( './logger.js')
  , splitargs = require( 'splitargs' )
  , cp = require( 'child_process' )
  , config = require( './config.json' );

function Stack(controller) {
  var app = new AppStack( controller );

  app.use( split );
  app.use( execute );

  this.request = app.request;

  function execute(req, res) {
    var command = ''
      , args = []
      , child;
      
    if (res.argv.length) {
      command = res.argv[0];
      if (res.argv.length > 1) {
        args = res.argv.splice(1);
      }
    }

    filterCommand( command, spawn, block );

    function block() {
      var msg = "'" + command + "' is blocked\n"; 
      controller.emit( 'feedback', msg );
      res.end();
    }

    function spawn() {
      process.stdin.pause(); 
      process.stdin.setRawMode( false );

      child = cp.spawn( 
        command, 
        args, 
        { 
          stdio: 'inherit',
          cwd: req.cwd
        });

      child.once( 'exit', function(code, signal) {
        process.stdin.resume();
        process.stdin.setRawMode( true );
        res.end();
      });
    }

    function filterCommand( command, pass, fail ) {
      for (var r in config.sandbox) {
        var re = new RegExp( config.sandbox[r] );
        if (re.test( command )) {
          pass();
          return;
        }
      }
      fail();
    }
  }
   
  function split(req, res) {
    assert( req.hasOwnProperty( 'params' ) );
    res.argv = splitargs(req.params);
    res.end();
  }
}

module.exports = Stack; 