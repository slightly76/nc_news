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

exports.fetchArticleById = (id) => {
	if (isNaN(id)) {
		return Promise.reject({
			status: 400,
			msg: 'Invalid Article ID',
		});
	}
	return db
		.query('SELECT * FROM articles WHERE article_id = $1;', [id])
		.then(({ rows }) => {
			if (rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: 'Article Not Found',
				});
			}
			return rows[0];
		});
};

exports.fetchArticlesSortedBy = (sortBy) => {
	console.log('sortby from model >>>', sortBy);
	const queryString = `SELECT * from articles ORDER by $1;`;

	return db.query(queryString, [sortBy]).then(({ rows }) => {
		console.log('rows from model >>>', rows);
		if (rows.length === 0) {
			return Promise.reject({
				status: 400,
				msg: 'Invalid Sort Request',
			});
		}
	});
};
