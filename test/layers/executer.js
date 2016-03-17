#!/usr/bin/env node

/* I think these test are obsolete, covered by mulepack now */

var assert = require( 'assert' )
  , Executer = require( '../../layers/executer' )
  , path = require( 'path' )
  , stream = require( 'stream' )
  , cp = require( 'child_process' )
  , events = require( 'events' )
  , Expector = require( 'expector' ).Expector
  , test = require( 'tape' ); 

assert( typeof Executer === 'function' );

test( 'checkError', function(t) {

  var executer = new Executer();
  var expector = new Expector(t);
  var context = defaultContext( expector ); 
  context.exec = [['cat', 'doesNotExist.txt']];
  context.cwd = __dirname;

  expector.expectNot( 'stdout' );
  expector.expect( 'exit', { code: 1, signal: null } );
  expector.expect( 'stderr' );

  executer.handle( context );
});

test( 'checkOut', function(t) {
  var executer = new Executer();
  var expector = new Expector(t);
  var context = defaultContext( expector );
  context.exec = [['ls']];
  context.cwd = path.join( __dirname, '../sample' );
  
  expector.expectNot( 'stderr' );
  expector.expect( 'stdout', new Buffer( 'test_dummy.txt\n' ) );
  executer.handle( context );
});

function defaultContext(expector) {
  return {
    controller: expector,
    stdout: 'pipe',
    stdin: 'pipe',
    next: function() {
      expector.check();
    }
  };
}