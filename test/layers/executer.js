#!/usr/bin/env node

/* I think these test are obsolete, covered by mulepack now */

var assert = require( 'assert' )
  , Executer = require( '../../layers/executer' )
  , path = require( 'path' )
  , stream = require( 'stream' )
  , cp = require( 'child_process' )
  , events = require( 'events' )
  , Expector = require( 'expector' ).Expector;

assert( typeof Executer === 'function' );

suite( 'executer', function() {

  var executer
    , expector;

  setup(function() {
    executer = new Executer();
    expector = new Expector();
  });

  teardown(function() {
    expector.check();
  });

  test( 'checkError', function(done) {
      
    var context = defaultContext(done); 
    context.exec = [['cat', 'doesNotExist.txt']];
    context.cwd = __dirname;

    context.next = function() {}
    expector.on( 'exit', function() {
      process.nextTick( done );
    });

    expector.expectNot( 'stdout' );
    expector.expect( 'exit', { code: 1, signal: null } );
    expector.expect( 'stderr' );

    executer.handle( context );
  });

  test( 'checkOut', function(done) {
    
    var context = defaultContext(done);

    context.exec = [['ls']];
    context.cwd = path.join( __dirname, '../sample' );
    
    context.next = function() {}
    expector.on( 'exit', function() {
      process.nextTick( done );
    });

    expector.expectNot( 'stderr' );
    expector.expect( 'stdout', new Buffer( 'test_dummy.txt\n' ) );
    executer.handle( context );
  });

  function defaultContext(done) {
    return {
      controller: expector,
      stdout: 'pipe',
      stdin: 'pipe',
      next: function(o) {
        done();
      }
    };
  }

  function dummyContext(done) {
    var result = defaultContext(done);
    result.exec = [['dummy_read']];
    result.env = process.env;
    result.env.PATH += ':' + path.join(__dirname, '../bin');
    return result;
  }

});
