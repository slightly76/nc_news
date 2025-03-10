const endpoints = require('../endpoints.json');
const { fetchAllTopics } = require('../model/get.model.js');

exports.getEndpoints = (request, response) => {
	return response.status(200).send({ endpoints });
};

exports.getAllTopics = (request, response) => {
	const { description, slug, img_url } = request.query;
	fetchAllTopics(description, slug, img_url).then((topics) => {
		try {
			response.status(200).send({ topics: topics });
		} catch {
			response.status(500).send({ msg: 'Internal Server Error' });
		}
	});
};
