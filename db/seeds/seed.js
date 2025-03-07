const db = require('../connection');
const format = require('pg-format');
const {
	injectUsers,
	injectTopics,
	injectArticles,
	getArticleIdMap,
	injectComments,
} = require('./utils');

const seed = async ({ topicData, userData, articleData, commentData }) => {
	await db.query(`DROP TABLE IF EXISTS comments CASCADE;`);
	await db.query(`DROP TABLE IF EXISTS articles CASCADE;`);
	await db.query(`DROP TABLE IF EXISTS topics CASCADE;`);
	await db.query(`DROP TABLE IF EXISTS users CASCADE;`);

	await createUsers();
	await createTopics();
	await createArticles();
	await createComments();

	await injectUsers(userData);
	await injectTopics(topicData);
	await injectArticles(articleData);
	await injectComments(commentData);
};

async function createUsers() {
	return db.query(`CREATE TABLE users (
    username VARCHAR PRIMARY KEY NOT NULL,
    name VARCHAR NOT NULL,
    avatar_url VARCHAR(1000)
    )`);
}

async function createTopics() {
	return db.query(`CREATE TABLE topics (
    slug VARCHAR PRIMARY KEY NOT NULL,
    description VARCHAR,
    img_url VARCHAR(1000)
    )`);
}

async function createArticles() {
	return db.query(`CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR NOT NULL,
    topic VARCHAR REFERENCES topics(slug) ON DELETE CASCADE,
    author VARCHAR references users(username) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000)
    )`);
}

async function createComments() {
	return db.query(`CREATE TABLE comments(
    comment_id SERIAL PRIMARY KEY NOT NULL,
    article_id INT REFERENCES articles(article_id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    votes INT DEFAULT 0,
    author VARCHAR REFERENCES users(username),
    created_at TIMESTAMP NOT NULL
    )`);
}

module.exports = seed;
