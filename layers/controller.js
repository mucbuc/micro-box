var assert = require( 'assert' )
  , cp = require( 'child_process' );

function Controller() {
  this.handle = function(req, res) {
	if (req.hasOwnProperty('argv')) {
		req.exec = [ req.argv ];
	}	
  	res.end();
  }; 
}

module.exports = Controller; 