function logRequest(params, res) {
	console.log( '*', params );
	console.log( res );
	res.end(); 
}

module.exports = logRequest;