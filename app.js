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
	getAllUsers,
	getArticlesByTopic,
} = require('./controller/get.controller.js');

const {
	psqlErrorHandler,
	customErrorHandler,
	serverErrorHandler,
	notFoundErrorHandler,
} = require('./errorHandlers.js');

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getArticlesSortedBy);

app
	.route('/api/articles/:article_id/comments')
	.get(getArticleComments)
	.post(addArticleComment);

app.get(`/api/users`, getAllUsers);

app.get(`/api/articles`, getArticlesByTopic);

app.patch('/api/articles/:article_id', updateArticleById);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.use(psqlErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

app.use(notFoundErrorHandler);

module.exports = app;
