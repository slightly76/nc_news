const endpoints = require('../endpoints.json');
const {
	fetchAllTopics,
	fetchArticleById,
	fetchArticlesSortedBy,
	fetchCommentsByArticleId,
	postArticleComment,
	patchArticleById,
	removeCommentById,
	fetchAllUsers,
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
	console.log(sort_by);
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

	postArticleComment(article_id, body, author)
		.then((comment) => {
			if (!comment || !comment.msg || !comment.comment) {
				return response.status(500).send({
					msg: 'Internal Server Error',
				});
			}

			response.status(201).send({
				msg: comment.msg,
				comment: comment.comment,
			});
		})
		.catch(next);
};

exports.getAllUsers = async (request, response, next) => {
	try {
		const users = await fetchAllUsers();
		if (users.length === 0) {
			return response.status(404).send({ msg: 'Not Found' });
		}
		response.status(200).send({ users });
	} catch (err) {
		next(err);
	}
};

exports.updateArticleById = async (request, response, next) => {
	const { article_id } = request.params;
	const body = request.body;
	try {
		const updatedArticle = await patchArticleById(article_id, body);
		response
			.status(200)
			.send({ msg: 'Votes Updated Successfully', article: updatedArticle });
	} catch (err) {
		next(err);
	}
};

exports.deleteCommentById = async (request, response, next) => {
	const { comment_id } = request.params;
	try {
		await removeCommentById(comment_id);
		response.status(204).send();
	} catch (err) {
		next(err);
	}
};
