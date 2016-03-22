'use strict';

let assert = require( 'assert' )
  , fs = require( 'fs' );

function Tracker() {

  let output = fs.createWriteStream('history.txt');
  process.on( 'exit', () => {
    output.end();
  });

  this.handle = function(o) {
    assert( o.input !== 'undefined' );
    output.write( o.output + '\n' );
    o.next(); 
  };
}

module.exports = Tracker;