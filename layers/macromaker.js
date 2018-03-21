'use strict'; 

let assert = require( 'assert' )
  , fs = require( 'fs' );

function Tracker() {

  this.handle = function(o) {
    assert( o.input !== 'undefined' );
    
    if (!o.code) {
      fs.readFile( './macros.json', function(err, data) {
        let macros
          , unique = [];
        if (err) throw err;
        macros = JSON.parse(data.toString());
        macros.push(o.input);
        macros
        .sort()
        .forEach( function(element, index, array) {
          let trimmed = element.trim()
          if (unique.indexOf(trimmed) === -1) {
            unique.push(trimmed);

            let outStream = fs.createWriteStream( './macros.json' );
            outStream.write(JSON.stringify(unique, null, '\t'))
            outStream.end();
          }
        });
      });
    o.next(); 
  }
  };
}

module.exports = Tracker;