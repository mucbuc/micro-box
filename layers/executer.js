var assert = require( 'assert' )
  , cp = require( 'child_process' )
  , tmp = require( 'tmp' )
  , fs = require( 'fs' )
  , events = require( 'events' )
  , util = require( 'util' )
  , mule = require( 'mulepack' );

assert( typeof mule !== 'undefined' );

function Executer() {

  this.handle = function(o) {

    if (o.hasOwnProperty('exec') && o.exec.length) {

      var controller = new events.EventEmitter();

      pause(process.stdin); 
      controller.on( 'exit', function(context) {
        resume(process.stdin);
        o.controller.emit( 'exit', context );
        process.nextTick( function() {
          o.next(o);
        });
      });

      mule( 
        o.exec, 
        { 
          stdout: o.stdout,
          stderr: o.stderr,
          stdin: o.stdin, 
          cwd: o.cwd
        }, 
        function(child) {
          
          if (typeof child === 'undefined') {
            resume(process.stdin);
            o.next(o);
            return;
          }

          assert( child.hasOwnProperty('stderr'));
          if (child.stdout) {
            child.stdout.on( 'data', function(data){
              o.controller.emit( 'stdout data', data.toString() );
            });
          }

          if (child.stdin) {
            o.controller.on( 'stdin data', function(data){
              child.stdin.write( data );
            });
          }

          child.stderr.on( 'data', function(data) {
            o.controller.emit( 'stderr data', data.toString() );
          });

          child.once( 'exit', function(code, signal) {
            controller.emit( 'exit', { 
                code: code, 
                signal: signal
              });
          });

          o.controller.once( 'kill', function() {
            child.kill();
          }); 
        }); 
    }
    else {
      o.next(o);
    }
  };

  function pause(stream) {
    if (typeof stream !== 'undefined') {
      stream.pause(); 
      stream.setRawMode( false );
    }
  }

  function resume(stream) {
    if (typeof stream !== 'undefined') {
      stream.resume(); 
      stream.setRawMode( true );
    }
  }
}

module.exports = Executer;