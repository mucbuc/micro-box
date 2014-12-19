var assert = require( 'assert' );

function NRepeater() {

  var previous = '';

  this.handle = function( req, res) { 
  
    if (previous.length) {
      var d = findDiff(previous, req.params);
      if (d > 0) {
        res.repeat = previous.substr(0, d);
      }
    }
    previous = req.params;
    
    res.end();

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