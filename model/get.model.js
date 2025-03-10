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
	return db
		.query('SELECT * FROM articles WHERE article_id = $1;', [id])
		.then(({ rows }) => {
			console.log('rows from model', rows);
			if (rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: 'Article Not Found',
				});
			}
			return rows[0];
		});
};
