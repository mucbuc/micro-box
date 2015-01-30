var assert = require( 'assert' )
  , cp = require( 'child_process' );

function Executer() {

  this.handle = function(req, res) {
          
    if (req.hasOwnProperty('exec') && req.exec.length) {
      req.exec.forEach( function(stub) {
        var command = stub[0]
          , argv = stub.length > 1 ? stub.splice(1) : [];
        spawn(command, argv);
      });
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