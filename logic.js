var cp = require( 'child_process' );

function Logic( controller ) {
	controller.on( 'command', function( data ) {
		var cmd = data.toString().split( ' ' )
		  , args = cmd.length > 1 ? cmd.splice(1) : [];

		var child = cp.spawn( 
			cmd[0], 
			args, 
			{ stdio: [ process.stdin, 'pipe', process.stderr ] } 
		);	

		child.stdout.pipe( controller );
		child.stdout.pipe( process.stdout );

	});
}

module.exports = Logic;