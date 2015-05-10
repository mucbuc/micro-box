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
        if (process.stdin) {
          process.stdin.resume();
          process.stdin.setRawMode( true );
        }
        o.controller.emit( 'exit', context );
        process.nextTick( function() {
          o.next(o);
        });
      });

      mule( 
        o.exec, 
        { 
          stdin: 'pipe', 
          stderr: 'pipe',
          cwd: o.cwd
        }, 
        function(child) {
          assert( child.hasOwnProperty('stderr'));
          if (child.stdout) {
            child.stdout.on( 'data', function(data){
              o.controller.emit( 'stdout data', data.toString() );
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