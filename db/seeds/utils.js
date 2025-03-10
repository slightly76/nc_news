const format = require('pg-format');
const db = require('../../db/connection');

async function injectUsers(data) {
	const columns = Object.keys(data[0]);
	const values = data.map(({ username, name, avatar_url }) => [
		username,
		name,
		avatar_url,
	]);
	const queryString = format(
		`
		INSERT INTO users (${columns.join(', ')})
		VALUES %L
		RETURNING *;`,
		values
	);
	const { rows } = await db.query(queryString);
	return rows;
}

async function injectTopics(data) {
	const columns = Object.keys(data[0]);
	const values = data.map(({ description, slug, img_url }) => [
		description,
		slug,
		img_url,
	]);
	const queryString = format(
		`
		INSERT INTO topics (${columns.join(', ')})
		VALUES %L
		RETURNING *;`,
		values
	);
	const { rows } = await db.query(queryString);
	return rows;
}

async function injectArticles(data) {
	const columns = Object.keys(data[0]);
	const convertedData = data.map(convertTimestampToDate);
	const queryString = format(
		`
		INSERT INTO articles (${columns.join(', ')})
		VALUES %L
		RETURNING *;`,
		convertedData.map((article) => {
			const { title, topic, author, body, created_at, votes, article_img_url } =
				article;
			return [title, topic, author, body, created_at, votes, article_img_url];
		})
	);
	const { rows } = await db.query(queryString);
	return rows;
}

async function getArticleIdMap() {
	const { rows } = await db.query('SELECT article_id, title FROM articles;');
	const articleIdMap = {};
	rows.forEach(({ article_id, title }) => {
		articleIdMap[title] = article_id;
	});
	return articleIdMap;
}

async function injectComments(data) {
	const articleIdMap = await getArticleIdMap();
	const convertedData = data.map(convertTimestampToDate);

	const commentValues = convertedData.map(
		({ article_title, body, votes, author, created_at }) => {
			const article_id = articleIdMap[article_title];

			//	const { article_id } = result.rows[0];
			return [article_id, body, votes, author, created_at];
		}
	);
	const queryString = format(
		`
		INSERT INTO comments (article_id, body, votes, author, created_at)
		VALUES %L
		RETURNING *;`,
		commentValues
	);
	const { rows } = await db.query(queryString);
	return rows;
}

convertTimestampToDate = ({ created_at, ...otherProperties }) => {
	if (!created_at) return { ...otherProperties };
	const formattedDate = new Date(created_at);
	return { created_at: formattedDate, ...otherProperties };
};

module.exports = {
	injectUsers,
	injectTopics,
	injectArticles,
	getArticleIdMap,
	injectComments,
	convertTimestampToDate,
};
