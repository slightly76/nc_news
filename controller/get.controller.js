const endpoints = require('../endpoints.json');
const {
	fetchAllTopics,
	fetchArticleById,
	fetchArticlesSortedBy,
} = require('../model/get.model.js');

exports.getEndpoints = (request, response) => {
	return response.status(200).send({ endpoints });
};

exports.getAllTopics = (request, response) => {
	const { description, slug, img_url } = request.query;
	fetchAllTopics(description, slug, img_url).then((topics) => {
		try {
			response.status(200).send({ topics: topics });
		} catch {
			next(err);
		}
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
	const { sortBy } = request.params;
	console.log('sortBy from controller >>>', sortBy);
	fetchArticlesSortedBy(sortedBy)
		.then((article) => {
			response.status(200).send({ article });
		})
		.catch((err) => {
			next(err);
		});
};
