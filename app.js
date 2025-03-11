const express = require('express');
const app = express();
const {
	getEndpoints,
	getAllTopics,
	getArticleById,
	getArticlesSortedBy,
	getArticleComments,
	addArticleComment,
} = require('./controller/get.controller.js');

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getArticlesSortedBy);

app.get('/api/articles/:article_id/comments', getArticleComments);

app.post('/api/articles/:article_id/comments', addArticleComment);

exports.errorHandler = (err, request, result, next) => {
	console.error(err);
	result.status(500).send({ msg: 'Internal Server Error' });
};

app.use((err, request, response, next) => {
	if (err.status) {
		response.status(err.status).send({ msg: err.msg });
	} else next(err);
});

app.use((err, request, response, next) => {
	if (err.code === '22P02') {
		response.status(400).send({ msg: 'Invalid Input' });
	} else next(err);
});

app.use((err, request, response, next) => {
	console.log(err);
	response.status(500).send({ msg: 'Internal Server Error' });
});

module.exports = app;
