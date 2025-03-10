const express = require('express');
const app = express();
const {
	getEndpoints,
	getAllTopics,
	getArticleById,
} = require('./controller/get.controller.js');

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

app.get('/api/articles/:article_id', getArticleById);

app.use((err, request, result, next) => {
	if (err.status) {
		result.status(err.status).send({ msg: err.msg });
	} else {
		res.status(500).send({ msg: 'Internal Server Error' });
	}
});

module.exports = app;
