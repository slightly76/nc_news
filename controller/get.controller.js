const endpoints = require('../endpoints.json');
const {
	fetchAllTopics,
	fetchArticleById,
	fetchArticlesSortedBy,
	fetchCommentsByArticleId,
	postArticleComment,
} = require('../model/get.model.js');

exports.getEndpoints = (request, response) => {
	return response.status(200).send({ endpoints });
};

exports.getAllTopics = (request, response) => {
	const { description, slug, img_url } = request.query;
	fetchAllTopics(description, slug, img_url)
		.then((topics) => {
			response.status(200).send({ topics: topics });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticleById = (request, response, next) => {
	const { article_id } = request.params;
	fetchArticleById(article_id)
		.then((article) => {
			response.status(200).send({ article });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticlesSortedBy = (request, response, next) => {
	const { sort_by } = request.query;
	fetchArticlesSortedBy(sort_by)
		.then((articles) => {
			response.status(200).send({ articles });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticleComments = (request, response, next) => {
	const { article_id } = request.params;
	fetchCommentsByArticleId(article_id)
		.then((comments) => {
			if (comments.length === 0) {
				return response.status(200).send({
					msg: 'No Comments ... Yet!',
					comments: [],
				});
			}
			response.status(200).send({ comments });
		})
		.catch((err) => {
			next(err);
		});
};

exports.addArticleComment = (request, response, next) => {
	const { article_id } = request.params;
	const { body, author } = request.body;
	if (isNaN(article_id)) {
		return response
			.status(400)
			.send({ msg: 'Bad Request: article_id must be a number' });
	}

	postArticleComment(article_id, body, author)
		.then((comment) => {
			if (!comment || !comment.msg || !comment.comment) {
				return response.status(500).send({
					msg: 'Internal Server Error: Failed to post comment',
				});
			}

			response.status(201).send({
				msg: comment.msg,
				comment: comment.comment,
			});
		})
		.catch((err) => {
			next(err);
		});
};
