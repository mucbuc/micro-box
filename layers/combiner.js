var assert = require( 'assert' )
  , cp = require( 'child_process' );

function Combiner() {
  this.handle = function(req, res) {
	if (req.hasOwnProperty('argv')) {
		assert(Array.isArray(req.argv));

		var index = req.argv.indexOf( '|' );
		if (index != -1) {
			//while (index != -1) {
				req.exec = [ req.argv ];
				//req.exec = [ req.argv.slice(0, index - 1) ];
				//req.argv = req.argv.slice(index + 1);
				//res.end();
			//}
		}
		else {
			req.exec = [ req.argv ];
		}
	}	
  	res.end();
  }; 
}

module.exports = Combiner; 