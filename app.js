const express = require('express');
const app = express();
const {
	getEndpoints,
	getAllTopics,
	getArticleById,
	getArticlesSortedBy,
} = require('./controller/get.controller.js');

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles?sort_by=created_at', getArticlesSortedBy);

app.use((err, request, result, next) => {
	if (err.status) {
		result.status(err.status).send({ msg: err.msg });
	} else next(err);
});

app.use((err, request, response, next) => {
	if (err.code === '22P02') {
		response.status(400).send({ msg: 'Invalid Input' });
	} else next(err);
});

app.use((err, request, response, next) => {
	console.log(err);
	response.status(500).send({ msg: 'Internal Sausage Error' });
});

module.exports = app;
