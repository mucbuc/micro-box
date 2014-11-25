var CD_Agent = require( 'cd-agent' )
  , AppStack = require( 'app-stack' )
  , logger = require( './logger.js')
  , splitargs = require( 'splitargs' )
  , cp = require( 'child_process' );

function Stack(controller) {
  var app = new AppStack( controller )
    , agent = new CD_Agent( controller )
    , cwd = process.cwd()
    , context = [];

  app.use( split );
  //app.use( logger );
  app.use( /cd\s+.*/, changeDir );
  app.use( function(params, res) {
    if (!res.hasOwnProperty('purpose')) {
      execute(params, res);
    }
  } ); 

  this.request = app.request;

  agent.process(['cd']);

  function execute(params, res) {
    var args = res.argv.length > 1 ? res.argv.splice(1) : []
      , child;
    res.end();
    process.stdin.pause(); 
    process.stdin.setRawMode( false );

    child = cp.spawn( 
      res.argv[0], 
      args, 
      { 
        stdio: 'inherit', 
        cwd: cwd
      } 
    );

    child.on( 'exit', function(code, signal) {
      console.log( "code: ", code, "signal: ", signal );
      process.stdin.resume();
      process.stdin.setRawMode( true );
      res.end();
    }); 
  }
   
  function split(params, res) {
    res.argv = splitargs(params);
    res.end();
  }

  function changeDir(params, res) {
    agent.process(res.argv, cwd);
    
    controller.once( 'cwd', function(next) {
      cwd = next;
      console.log( next );
      done();
    });

    controller.once( 'ls', function(list) {
      context = list;
      done();
    });

    function done() {
      res.purpose = 'cd';
      res.end();
    }
  }
}

module.exports = Stack; 