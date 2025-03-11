const express = require('express');
const app = express();
const port = 8080;

const server = http.createServer((request, response) => {
	console.log('Request Received');
});

app.listen(port, (err) => {
	if (err) {
		console.log(err);
	} else {
		console.log('Server is listening on port', port, '...');
	}
});
