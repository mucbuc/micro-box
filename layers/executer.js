var assert = require( 'assert' )
  , cp = require( 'child_process' )
  , tmp = require( 'tmp' )
  , fs = require( 'fs' )
  , events = require( 'events' )
  , util = require( 'util' );

function Executer() {

  this.handle = function(req, res) {

    if (req.hasOwnProperty('exec') && req.exec.length) {

      var controller = new events.EventEmitter();

      process.stdin.pause(); 
      process.stdin.setRawMode( false );

      controller.on( 'exit', function(code, signal, outPath) {
        if (    !code 
            &&  req.exec.length) {
          execLine(outPath);
        }
        else {
          process.stdin.resume();
          process.stdin.setRawMode( true );
          res.end();
          res.controller.emit( 'exit', code, signal );
        }
      });

      execLine();

      function execLine(outPath) {
        
        assert( req.exec.length );

        controller.once( 'stdin ready', function(stdin) {
          controller.once( 'stdout ready', function(stdout, path) {
            spawn( getContext(req, stdin, stdout) ) 
            .once( 'exit', function(code, signal) {
              controller.emit( 'exit', code, signal, path );
            })
            .on( 'error', function(data) {
              console.log( data.toString() );
              controller.emit( 'exit', 1 );
            });

            req.exec.splice(0,1);
          });

          openStdout(req.exec, function(fd, path) {
            controller.emit( 'stdout ready', fd, path );
          });
        } );

        openStdin(outPath, function(fd) {
          controller.emit( 'stdin ready', fd );
        });
      }
    }

    function openStdout(line, callback) {
      if (line.length <= 1) {
        callback( process.stdout );
      }
      else {
        tmp.file( function( err, path ) {
          if (err) throw err;
          fs.open(path, 'a+', function(err, fd) {
            if (err) throw err;
            callback(fd, path);
          });
        }); 
      }
    }

    function openStdin(path, callback) {
      if (typeof path === 'undefined') {
        callback( process.stdin );
      }
      else {
        fs.open(path, 'r', function(err, fd) {
          if (err) throw err;
          callback(fd);
        });
      }
    }

    function getContext(req, stdin, stdout) {
      var args = req.exec[0]
        , result = {
            cmd: args[0],
            argv: args.length > 1 ? args.splice(1) : [],
            cwd: req.cwd,
            stdin: stdin, 
            stdout: stdout
          };
      
      return result;
    }
  };

}

function spawn(context) {

  assert(context.hasOwnProperty('cmd'));
  assert(context.hasOwnProperty('cwd'));
  assert(context.hasOwnProperty('argv'));

  if (!context.hasOwnProperty('stdin')) {
    context.stdin = process.stdin;
  }

  if (!context.hasOwnProperty('stdout')) {
    context.stdout = process.stdout;
  }

  return cp.spawn(
    context.cmd, 
    context.argv, 
    { 
      stdio: [ context.stdin, context.stdout, process.stderr ],
      cwd: context.cwd
    });
} 

module.exports = Executer;