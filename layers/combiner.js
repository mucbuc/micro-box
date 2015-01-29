var assert = require( 'assert' )
  , cp = require( 'child_process' );

function Combiner() {
  this.handle = function(req, res) {
	if (req.hasOwnProperty('argv')) {
		assert(Array.isArray(req.argv));

		var index = findNextPipe( req.argv );
		if (index != -1) {
			var argv = req.argv; 
			req.exec = [];

			while (index != -1) {
				req.exec.push( argv.slice(0, index) );
				argv = argv.slice(index + 1);
				index = findNextPipe( argv );
			}
			req.exec.push( argv );
		}
		else {
			req.exec = [ req.argv ];
		}
	}	
  	res.end();
  }; 

	function findNextPipe(argv) {
		return argv.indexOf( '|' );
	}
}

module.exports = Combiner; 