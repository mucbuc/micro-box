#!/usr/bin/env node

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

    expector.expectNot( 'stdout data' );
    expector.expect( 'exit', { code: 1, signal: null } );
    expector.expect( 'stderr data' );

    executer.handle( context );
  });

  test( 'checkOut', function(done) {
    
    var context = defaultContext(done);

    context.exec = [['ls']];
    context.cwd = path.join( __dirname, '../sample' );
    
    expector.expectNot( 'stderr data' );
    expector.expect( 'stdout data', 'test_dummy.txt' );
    expector.expect( 'exit', { code: 0, signal: null } ); 
    executer.handle( context );
  });

  test( 'checkKill', function(done) {
    var context = dummyContext(done);

    expector.expect( 'kill' );
    executer.handle( context );
    
    context.controller.emit('kill');
  });

  test( 'checkIn', function(done) {
    var context = dummyContext(done);
    expector.expect( 'exit' );
    executer.handle( context );
    expector.emit( 'stdin data', 'a\n' );
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
    result.env.PATH += ':/Users/markymark/work/micro-box/test/bin';
    return result;
  }

});

/* from jsthree test_processor.js
function checkKill() {
  var e = getDummy();

  e.on( 'exit', function() { 
    console.log( 'check kill passed' );
  } );

  e.emit( 'execute' );
  e.emit( 'kill' ); 
}

function checkIn() {
  var e = getDummy();

  e.emit( 'execute' );
  e.emit( 'stdin', 'a\n' );
  e.on( 'exit', function() { 
    console.log( 'check in passed' );
  } );
}

function getDummy() {
  var e = new events.EventEmitter()
    , wd = path.join( __dirname, 'bin' )
    , p = new Processor( { cmd: "./dummy_read", cwd: wd }, e );

  return e;
}*/
