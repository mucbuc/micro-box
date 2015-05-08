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

      controller.on( 'exit', function(context) {

        if (    !context.code 
            &&  o.exec.length) {
          execLine(context.outPath);
        }
        else {
          process.stdin.resume();
          process.stdin.setRawMode( true );
          o.controller.emit( 'exit', context );
          process.nextTick( function() {
            o.next(o);
          });
        }
      });

      execLine();

      function execLine(outPath) {
        
        var streams = {}
          , paths = {};

        assert( o.exec.length );

        controller.once( 'stdin ready', function(stdin) {
          streams.stdin = stdin;
          checkIfReady(streams);
        } );

        controller.once( 'stdout ready', function(stdout, path) {
          streams.stdout = stdout;
          streams.outPath = path;
          checkIfReady(streams);
        }); 

        controller.once( 'stderr ready', function(stderr, path) {
          streams.stderr = stderr;
          streams.errPath = path;
          checkIfReady(streams);
        }); 

        controller.once( 'ready', function(){
          var child = spawn( getContext(
                o, 
                streams.stdin, 
                streams.stdout, 
                streams.stderr
              ) );

          if (child.stdout) {
            child.stdout.on( 'data', function(data){
              o.controller.emit( 'stdout data', data.toString() );
            });
          }

          if (child.stderr) {
            child.stderr.on( 'data', function(data) {
              o.controller.emit( 'stderr data', data.toString() );
            });
          }

          child.once( 'exit', function(code, signal) {
            controller.emit( 'exit', { 
                code: code, 
                signal: signal, 
                outPath: paths.outPath, 
                errPath: paths.errPath 
              });
          });

          o.controller.once( 'kill', function() {
            child.kill();
          }); 
          
          o.exec.splice(0,1);
        });

        openStdin(outPath, function(fd) {
          controller.emit( 'stdin ready', fd );
        });

        openOutStream(o.exec, 'stdout', function(fd, path) {
          controller.emit( 'stdout ready', fd, path );
        });

        openOutStream(o.exec, 'stderr', function(fd, path) {
          controller.emit( 'stderr ready', fd, path );
        });

        function checkIfReady(streams) {
          if(   streams.hasOwnProperty('stdin') 
            &&  streams.hasOwnProperty('stdout')
            &&  streams.hasOwnProperty( 'stderr' ))
          {
            controller.emit( 'ready' );  
          }
        }
      }
    }
    else {
      o.next(o);
    }

    function openOutStream(line, name, callback) {
      if (line.length <= 1) {
        callback( o.hasOwnProperty(name) ? o[name] : process[name] );
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

    function getContext(req, stdin, stdout, stderr) {
      var args = req.exec[0]
        , result = {
          cmd: args[0],
            argv: args.length > 1 ? args.splice(1) : [],
            cwd: req.cwd,
            stdin: stdin, 
            stdout: stdout,
            stderr: stderr
          };
      
      return result;
    }
  };

}

function spawn(context) {

  assert(context.hasOwnProperty('cmd'));
  assert(context.hasOwnProperty('cwd'));
  assert(context.hasOwnProperty('argv')); 

  ['stdin', 'stdout', 'stderr']
  .forEach(function(name){
    if (!context.hasOwnProperty(name)) {
      context[name] = process[name];
    }
  });

  return cp.spawn(
    context.cmd, 
    context.argv, 
    { 
      stdio: [ context.stdin, context.stdout, context.stderr ],
      cwd: context.cwd
    });
} 

module.exports = Executer;