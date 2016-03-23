'use strict';
let assert = require( 'assert' );

function NRepeater() {

  let previous = '';

  this.handle = function(o) { 
    if (previous.length) {
      let d = findDiff(previous, o.input);
      if (d > 0) {
        o.repeat = previous.substr(0, d);
      }
    }
    previous = o.input;
    o.next();

    function findDiff(lhs, rhs) {
      let index = 0;
      while (   index < rhs.length 
            &&  index < lhs.length
            &&  rhs.charAt(index) == lhs.charAt(index)) 
      {
        ++index;
      }
      return index;
    }
  };
}

module.exports = NRepeater;