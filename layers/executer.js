var assert = require( 'assert' )
  , cp = require( 'child_process' )
  , tmp = require( 'tmp' )
  , fs = require( 'fs' )
  , events = require( 'events' )
  , util = require( 'util' );

function Executer() {

  this.handle = function(o) {

    if (o.hasOwnProperty('exec') && o.exec.length) {

      var controller = new events.EventEmitter();

      process.stdin.pause(); 
      process.stdin.setRawMode( false );

      controller.on( 'exit', function(code, signal, outPath) {
        if (    !code 
            &&  o.exec.length) {
          execLine(outPath);
        }
        else {
          process.stdin.resume();
          process.stdin.setRawMode( true );
          o.next();
          o.controller.emit( 'exit', code, signal );
        }
      });

      execLine();

      function execLine(outPath) {
        
        assert( o.exec.length );

        controller.once( 'stdin ready', function(stdin) {
          controller.once( 'stdout ready', function(stdout, path) {
            var child = spawn( getContext(o, stdin, stdout) );

            if (child.stdout) {
              child.stdout.on( 'data', function(data){
                o.controller.emit( 'stdout data', data.toString() );
              });
            }

            child.once( 'exit', function(code, signal) {
              controller.emit( 'exit', code, signal, path );
            });
            child.on( 'error', function(data) {
              console.log( data.toString() );
              controller.emit( 'exit', 1 );
            });

            o.exec.splice(0,1);
          });

          openStdout(o.exec, function(fd, path) {
            controller.emit( 'stdout ready', fd, path );
          });
        } );

        openStdin(outPath, function(fd) {
          controller.emit( 'stdin ready', fd );
        });
      }
    }
    else {
      o.next();
    }

    function openStdout(line, callback) {
      if (line.length <= 1) {
        callback( o.hasOwnProperty('stdout') ? o.stdout : process.stdout );
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