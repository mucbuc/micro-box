var assert = require( 'assert' )
  , fs = require( 'fs' );

function Tracker() {

	var output = fs.createWriteStream('history.txt');
	process.on( 'exit', function() {
		output.end();
	});

  this.handle = function(req, res) {
    assert( req.hasOwnProperty( 'params' ) );
    output.write( req.params + '\n' );
		res.end();	
  };
}

module.exports = Tracker;