'use strict';

let assert = require( 'assert' )
  , cp = require( 'child_process' )
  , tmp = require( 'tmp' )
  , fs = require( 'fs' )
  , events = require( 'events' )
  , util = require( 'util' )
  , mule = require( 'mulepack' );

assert( typeof mule !== 'undefined' );

function Executor() {

  this.handle = function(o) {

    if (o.hasOwnProperty('exec') && o.exec.length) {

      mule( 
        o.exec, 
        { 
          /*stdout: o.stdout,
          stderr: o.stderr,
          stdin: o.stdin, */
          stdio: 'pipe',
          cwd: o.cwd
        })
      .then( child => {
        if (typeof child === 'undefined') {
          o.next(o);
          return;
        }
        
        child.on( 'error', (error) => {
          console.log( error );
        });

        if (child.stdin) {
          o.controller.on( 'stdin', (data) => {
            child.stdin.write( data );
          });
        }

        if (child.stdout) {
          child.stdout.on( 'data', (data) => {
            o.controller.emit( 'stdout', data );
          });
        }

        if (child.stderr) {
          child.stderr.on( 'data', (data) => {
            o.controller.emit( 'stderr', data );
          });
        }

        child.once( 'exit', (code, signal) => {
          o.controller.emit( 'exit', { code: code, signal: signal } );
          o.next(o);
        });

        o.controller.once( 'kill', () => {
          child.kill();
        });

      })
      .catch( (error) => {
        o.next(o);
      });
    }
    else {
      o.next(o);
    }
  }
}

module.exports = Executor;