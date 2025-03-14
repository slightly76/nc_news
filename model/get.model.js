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

exports.fetchArticleById = async (article_id) => {
	try {
		const queryString = `SELECT 
    articles.article_id, 
    articles.title, 
    articles.topic, 
    articles.author, 
	articles.body,
    articles.created_at, 
    articles.votes, 
    articles.article_img_url,
    CAST(COUNT(comments.comment_id) AS INT) AS comment_count
FROM articles
LEFT JOIN comments ON comments.article_id = articles.article_id
WHERE articles.article_id = $1
GROUP BY articles.article_id;`;
		const { rows } = await db.query(queryString, [article_id]);
		if (rows.length === 0) {
			throw { status: 404, msg: 'Article Not Found' };
		}
		return rows[0];
	} catch (err) {
		throw err;
	}
};

exports.fetchArticlesSortedBy = async (
	sortBy = 'created_at',
	order = 'DESC',
	topic = null
) => {
	const validSortFields = [
		'created_at',
		'votes',
		'title',
		'author',
		'topic',
		'article_id',
		'article_img_url',
	];
	const validOrder = ['ASC', 'DESC'];

	if (!validSortFields.includes(sortBy)) {
		return Promise.reject({ status: 400, msg: 'Invalid Sort Request' });
	}
	if (!validOrder.includes(order.toUpperCase())) {
		return Promise.reject({ status: 400, msg: 'Invalid Order Request' });
	}
	const queryParams = [];
	let queryString = `
		SELECT articles.article_id, articles.title, articles.topic, articles.author, 
		articles.created_at, articles.votes, articles.article_img_url,
		CAST(COUNT(comments.comment_id) AS INT) AS comment_count
		FROM articles
		LEFT JOIN comments ON comments.article_id = articles.article_id`;

	if (topic) {
		//const topicFilterQuery = `SELECT * from topics WHERE slug = $1;`;
		const topicFilterQuery = `SELECT * FROM topics WHERE slug = $1;`;
		const topicResult = await db.query(topicFilterQuery, [topic]);
		if (topicResult.rows.length === 0) {
			return Promise.reject({ status: 404, msg: 'Topic Not Found' });
		}
		queryString += ` WHERE LOWER(articles.topic) = LOWER($1)`;
		queryParams.push(topic);
	}

	queryString += ` GROUP BY articles.article_id
		ORDER BY ${sortBy} ${order.toUpperCase()} 
		;`;

	const articlesResult = await db.query(queryString, queryParams);
	return articlesResult.rows;
};

exports.fetchCommentsByArticleId = (
	article_id,
	sort_by = 'created_at',
	order = 'DESC'
) => {
	const validSortFields = [
		'comment_id',
		'votes',
		'created_at',
		'author',
		'body',
	];
	const validOrder = ['ASC', 'DESC'];

	if (!validSortFields.includes(sort_by)) {
		return Promise.reject({ status: 400, msg: 'Invalid Sort Request' });
	}
	if (!validOrder.includes(order.toUpperCase())) {
		return Promise.reject({ status: 400, msg: 'Invalid Order Request' });
	}

	if (isNaN(Number(article_id))) {
		return Promise.reject({ status: 400, msg: 'Invalid Input' });
	}
	return db
		.query(`SELECT * from articles WHERE article_id = $1;`, [article_id])
		.then(({ rows }) => {
			if (rows.length === 0) {
				return Promise.reject({ status: 404, msg: 'Article Not Found' });
			}

			return db.query(
				`SELECT comments.comment_id, comments.votes, comments.created_at, comments.author, comments.body, articles.article_id
				FROM comments
				LEFT JOIN articles on comments.article_id = articles.article_id
				WHERE comments.article_id = $1
				ORDER BY comments.created_at DESC
				;`,
				[article_id]
			);
		})
		.then(({ rows }) => {
			return rows;
		});
};

exports.postArticleComment = (article_id, body, username) => {
	if (!body || !username) {
		return Promise.reject({ status: 400, msg: 'Bad Request' });
	}
	const articleQuery = `
	SELECT title, author
	FROM articles
	WHERE article_id = $1;`;

	return db
		.query(articleQuery, [article_id])
		.then(({ rows }) => {
			if (rows.length === 0) {
				return Promise.reject({ status: 404, msg: 'Article Not Found' });
			}

			const { title, author: article_author } = rows[0];
			const created_at = new Date().toISOString();

			const commentQuery = `
			INSERT INTO comments (article_id, body, author, created_at)
			VALUES ($1, $2, $3, $4)
			RETURNING *
			;`;

			return db.query(commentQuery, [article_id, body, username, created_at]);
		})
		.then(({ rows }) => {
			return { msg: 'Comment Posted Successfully', comment: rows[0] };
		})
		.catch((err) => {
			return Promise.reject(err);
		});
};

exports.patchArticleById = async (article_id, body) => {
	try {
		if (!body.inc_votes && body.inc_votes !== 0) {
			throw { status: 400, msg: 'Bad Request' };
		}
		const articleToUpdate = await exports.fetchArticleById(article_id);
		if (!articleToUpdate) {
			throw { status: 404, msg: 'Article Not Found' };
		}
		const newVotes = body.inc_votes;
		if (isNaN(newVotes)) {
			throw { status: 400, msg: 'Bad Request' };
		}
		const { rows } = await db.query(
			`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
			[newVotes, article_id]
		);
		return rows[0];
	} catch (err) {
		throw err;
	}
};

exports.removeCommentById = async (comment_id) => {
	const { rows } = await db.query(
		`SELECT * FROM comments WHERE comment_id = $1;`,
		[comment_id]
	);
	if (rows.length === 0) {
		throw { status: 404, msg: 'Not Found' };
	}
	await db.query(`DELETE FROM comments WHERE comment_id = $1;`, [comment_id]);
	return { msg: 'Comment Deleted Successfully' };
};

exports.fetchAllUsers = async () => {
	try {
		const { rows } = await db.query(`SELECT * from users;`);
		if (rows.length === 0) {
			throw { status: 404, msg: 'Not Found' };
		}
		return rows;
	} catch (err) {
		throw err;
	}
};
