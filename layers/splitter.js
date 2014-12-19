var assert = require( 'assert' ) 
  , splitargs = require( 'splitargs' );

function Splitter() {
  this.handle = function(req, res) {
    assert( req.hasOwnProperty( 'params' ) );
    req.argv = splitargs(req.params);
    res.end();
  };
}

module.exports = Splitter;