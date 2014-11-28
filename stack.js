var assert = require( 'assert' ) 
  , AppStack = require( 'app-stack' )
  , logger = require( './logger.js')
  , splitargs = require( 'splitargs' )
  , cp = require( 'child_process' );

function Stack(controller) {
  var app = new AppStack( controller );

  app.use( split );
  app.use( execute );

  this.request = app.request;

  function execute(req, res) {
    var args = res.argv.length > 1 ? res.argv.splice(1) : []
      , child;
    process.stdin.pause(); 
    process.stdin.setRawMode( false );

    child = cp.spawn( 
      res.argv[0], 
      args, 
      { stdio: 'inherit' } 
    );

    child.on( 'exit', function(code, signal) {
      console.log( "code: ", code, "signal: ", signal );
      process.stdin.resume();
      process.stdin.setRawMode( true );
      res.end();
    }); 
  }
   
  function split(req, res) {
    assert( req.hasOwnProperty( 'params' ) );
    res.argv = splitargs(req.params);
    res.end();
  }
}

module.exports = Stack; 