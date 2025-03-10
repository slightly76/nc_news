const db = require('../db/connection');

exports.fetchAllTopics = () => {
	const queryString = 'SELECT * FROM topics;';
	return db.query(queryString).then(({ rows }) => {
		if (rows.length === 0) {
			return Promise.reject({
				status: 404,
				msg: 'No Topics Found',
			});
		}
		return rows;
	});
};
