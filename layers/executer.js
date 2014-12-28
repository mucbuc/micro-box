var assert = require( 'assert' )
  , cp = require( 'child_process' );

function Executer() {

  this.handle = function(req, res) {
          
    if (req.hasOwnProperty('argv') && req.argv.length) {
      var command = ''
        , argv = []
        , stub = req.exec[0];

      command = stub[0];
      if (stub.length > 1) {
        argv = stub.splice(1);
      }
      spawn(command, argv);
    }
    else {
      res.end();
    }

    function spawn(command, argv) {
      
      var child;

      process.stdin.pause(); 
      process.stdin.setRawMode( false );

      child = cp.spawn(
        command, 
        argv, 
        { 
          stdio: 'inherit',
          cwd: req.cwd
        });

      child.on( 'error', function(err) {
        console.log( err );
        exit(err.code)
      });

      child.once( 'exit', exit );
     
      function exit(code, signal) {
        process.stdin.resume();
        process.stdin.setRawMode( true );
        res.end();
        res.controller.emit( 'exit', code, signal );
      }
    }
  };
}

module.exports = Executer;