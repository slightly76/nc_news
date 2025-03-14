const express = require('express');
const app = express();
const { PORT = 8080 } = process.env;

const server = http.createServer((request, response) => {
	console.log('Request Received');
});

app.listen(PORT, (err) => {
	if (err) {
		console.log(err);
	} else {
		console.log('Server is listening on port ${PORT} ...');
	}
});
