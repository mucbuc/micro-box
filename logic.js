var cp = require( 'child_process' );

function Logic( controller ) {
	controller.on( 'command', function( data ) {
		var cmd = data.toString().split( ' ' )
		  , args = cmd.length > 1 ? cmd.splice(1) : [];

		process.stdin.pause(); 
		process.stdin.setRawMode( false );

		var child = cp.spawn( 
			cmd[0], 
			args, 
			{ stdio: 'inherit' } 
		);	
		

		// process.stdout.on( 'data', function( data ) {
		// 	controller.emit( 'data', data );
		// } );
		//child.stdout.pipe( controller );
		//child.stdout.pipe( process.stdout );
		//process.stdout.pause(); 

	});
}

module.exports = Logic;