#!/usr/bin/env node

var net = require( 'net' )
  , cp = require( 'child_process' );

net.createServer( function(socket) {
	socket.on( 'data', function( data ) {
		var cmd = data.toString().split( ' ' )
		  , args = cmd.length > 1 ? cmd.splice(1) : [];
		
		var child = cp.spawn( 
			cmd[0], 
			args, 
			{ stdio: [ process.stdin, 'pipe', process.stderr ] } 
		);	

		child.stdout.pipe( socket );
		child.stdout.pipe( process.stdout );
	});
 
}).listen( 3000 ); 
