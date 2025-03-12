const express = require('express');
const app = express();
const {
	getEndpoints,
	getAllTopics,
	getArticleById,
	getArticlesSortedBy,
	getArticleComments,
	addArticleComment,
	updateArticleById,
	deleteCommentById,
} = require('./controller/get.controller.js');

const {
	psqlErrorHandler,
	customErrorHandler,
	serverErrorHandler,
} = require('./errorHandlers.js');

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getArticlesSortedBy);

app.get('/api/articles/:article_id/comments', getArticleComments);

app.post('/api/articles/:article_id/comments', addArticleComment);

app.patch('/api/articles/:article_id', updateArticleById);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.use(psqlErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
