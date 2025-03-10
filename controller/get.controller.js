const endpoints = require('../endpoints.json');
const { fetchEndpoints } = require('../model/get.model.js');

exports.getEndpoints = (request, response) => {
	console.log('endpoints from controller', endpoints);
	return response.status(200).send({ endpoints });
};

// exports.getAllTopics(request, response) {
// 	fetchAllTopics().then((topics) => {
// 		response.status(200).send({topics: topics});
// 	});
// }
