var assert = require( 'assert' )
  , fs = require( 'fs' );

function Tracker() {

	var output = fs.createWriteStream('history.txt');
	process.on( 'exit', function() {
		output.end();
	});

  this.handle = function(o) {
    assert( o.input !== 'undefined' );
    output.write( o.output + '\n' );
		o.next();	
  };
}

module.exports = Tracker;