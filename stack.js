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
    if (!res.hasOwnProperty('purpose')) 
      execute(params, res);
  } ); 

  this.request = app.request;

  function execute(params, res) {
    var args = res.argv.length > 1 ? res.argv.splice(1) : []
      , child;
    
    process.stdin.pause(); 
    process.stdin.setRawMode( false );

    child = cp.spawn( 
      res.argv[0], 
      args, 
      { stdio: 'inherit' } 
    );  
        // process.stdout.on( 'data', function( data ) {
    //  controller.emit( 'data', data );
    // } );
    //child.stdout.pipe( controller );
    //child.stdout.pipe( process.stdout );
    //process.stdout.pause(); 
  }
   
  function split(params, res) {
    res.argv = splitargs(params);
    res.end();
  }

  function changeDir(params, res) {
    controller.once( 'cwd', function(next) {
      cwd = next;
      console.log( 'cwd: ', cwd );
    });

    controller.once( 'ls', function(list) {
      context = list;
    });

    agent.process(res.argv, cwd);
    res.purpose = 'cd';
    res.end();
  }
}

module.exports = Stack; 