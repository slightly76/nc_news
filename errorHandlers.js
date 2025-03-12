exports.customErrorHandler = (err, request, response, next) => {
	if (err.status && err.msg) {
		response.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
};

exports.psqlErrorHandler = (err, request, response, next) => {
	if (err.code === '22P02') {
		response.status(400).send({ msg: 'Bad Request' });
	}
	if (err.code === '23503') {
		response.status(404).send({ msg: 'User Not Found' });
	}

	next(err);
};

exports.serverErrorHandler = (err, request, result, next) => {
	console.error(err);
	result.status(500).send({ msg: 'Internal Server Error' });
};
