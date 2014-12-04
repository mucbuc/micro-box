var assert = require( 'assert' ) 
  , AppStack = require( 'app-stack' )
  , splitargs = require( 'splitargs' )
  , cp = require( 'child_process' )
  , config = require( './config.json' )
  , CDAgent = require( 'cd-agent' );

function Stack(controller) {
  var app = new AppStack( function() { 
        return { controller: controller }; 
      } )
    , cd_agent = new CDAgent();

  app.use( split );
  app.use( /cd\s+.*/, function(req, res) {
    cd_agent.eval( res.argv, function(cwd, list) {
      delete res.argv;
      res.end(); 
    });
  });
  app.use( filter );
  app.use( execute );

  this.request = app.request;

  function filter( req, res ) {
    var tmp; 
    for (var r in config.sandbox) {
      var re = new RegExp( config.sandbox[r] );
      if (re.test(req.params)) {
        res.end();
        return;
      }
    }
    res.controller.emit( 'feedback', "'" + res.argv[0] + "' is blocked\n" );
    delete res.argv;
    res.end();
  }

  function execute(req, res) {

    var command = ''
      , argv = []
      , child;
      
    if (res.hasOwnProperty('argv') && res.argv.length) {
      command = res.argv[0];
      if (res.argv.length > 1) {
        argv = res.argv.splice(1);
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
          cwd: cd_agent.cwd
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
  }
   
  function split(req, res) {
    assert( req.hasOwnProperty( 'params' ) );
    res.argv = splitargs(req.params);
    res.end();
  }
}

Stack.prototype = new AppStack(); 

module.exports = Stack; 
