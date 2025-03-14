const express = require('express');
const app = express();
const { PORT = 8080 } = process.env;

app.listen(PORT, (err) => {
	if (err) {
		console.log(err);
	} else {
		console.log('Server is listening on port ${PORT} ...');
	}
});
