var assert = require( 'assert' )
  , cp = require( 'child_process' );

function Executer() {

  this.handle = function(req, res) {
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