var assert = require( 'assert' );

function NRepeater() {

  var previous = '';

  this.handle = function(o) { 
    if (previous.length) {
      var d = findDiff(previous, o.input);
      if (d > 0) {
        o.repeat = previous.substr(0, d);
      }
    }
    previous = o.input;
    console.log( 'onextREP' );
    o.next();

    function findDiff(lhs, rhs) {
      var index = 0;
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