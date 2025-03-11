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
			if (rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: 'Article Not Found',
				});
			}
			return rows[0];
		});
};

exports.fetchArticlesSortedBy = (sortBy = 'created_at') => {
	const validSortFields = [
		'created_at',
		'votes',
		'title',
		'author',
		'topic',
		'article_id',
	];
	if (!validSortFields.includes(sortBy)) {
		return Promise.reject({ status: 400, msg: 'Invalid Sort Request' });
	}
	const queryString = `
		SELECT articles.article_id, articles.title, articles.topic, articles.author, 
		articles.created_at, articles.votes, articles.article_img_url,
		CAST(COUNT (comments.comment_id) AS INT)	 AS comment_count
		FROM articles
		LEFT JOIN comments ON comments.article_id = articles.article_id
		GROUP BY articles.article_id
		ORDER BY ${sortBy} DESC
		;`;

	return db.query(queryString).then(({ rows }) => {
		return rows;
	});
};

exports.fetchCommentsByArticleId = (article_id) => {
	return db
		.query(
			`SELECT comments.comment_id, comments.votes, comments.created_at, comments.author, comments.body, articles.article_id
			FROM comments
			LEFT JOIN articles on comments.article_id = articles.article_id
			WHERE comments.article_id = $1
			ORDER BY comments.created_at DESC
			;`,
			[article_id]
		)
		.then(({ rows }) => {
			if (rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: 'Article Not Found',
				});
			}
			return rows;
		});
};
