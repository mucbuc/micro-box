var assert = require( 'assert' )
  , cp = require( 'child_process' );

function Combiner() {
  this.handle = function(o) {
	if (o.hasOwnProperty('argv')) {
		assert(Array.isArray(o.argv));

		var index = findNextPipe( o.argv );
		if (index != -1) {
			var argv = o.argv; 
			o.exec = [];

			while (index != -1) {
				o.exec.push( argv.slice(0, index) );
				argv = argv.slice(index + 1);
				index = findNextPipe( argv );
			}
			o.exec.push( argv );
		}
		else {
			o.exec = [ o.argv ];
		}
	}	
  	o.next();

	function findNextPipe(argv) {
		return argv.indexOf( '|' );
	}
  }; 
}

module.exports = Combiner; 