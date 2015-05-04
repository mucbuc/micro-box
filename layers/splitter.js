var assert = require( 'assert' ) 
  , splitargs = require( 'splitargs' );

function Splitter() {

  this.handle = function(o) {
    o.argv = splitargs(o.input);
    o.next();
  };
}

module.exports = Splitter;