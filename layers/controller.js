var assert = require( 'assert' )
  , cp = require( 'child_process' );

function Controller() {
  this.handle = function(req, res) {
	req.exec = [];
	req.exec.push( req.argv );	
  	res.end();
  }; 
}

module.exports = Controller; 