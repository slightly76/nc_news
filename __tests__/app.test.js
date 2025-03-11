const endpointsJson = require('../endpoints.json');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const request = require('supertest');
const app = require('../app.js');
require('jest-sorted');

beforeAll(() => seed(data));
afterAll(() => db.end());

describe('GET /api', () => {
	test('200: Responds with an object detailing the documentation for each endpoint', () => {
		return request(app)
			.get('/api')
			.expect(200)
			.then(({ body: { endpoints } }) => {
				expect(endpoints).toEqual(endpointsJson);
			});
	});
	test('200: Responds with an array of all topics', () => {
		return request(app)
			.get('/api/topics')
			.expect(200)
			.then(({ body: { topics } }) => {
				expect(topics).toBeInstanceOf(Array);
				expect(topics.length).toBeGreaterThan(0);
				topics.forEach((topic) => {
					expect(topic).toEqual(
						expect.objectContaining({
							slug: expect.any(String),
							description: expect.any(String),
							img_url: expect.any(String),
						})
					);
				});
				expect(topics).toEqual([
					{
						description: 'The man, the Mitch, the legend',
						slug: 'mitch',
						img_url: '',
					},
					{
						description: 'Not dogs',
						slug: 'cats',
						img_url: '',
					},
					{
						description: 'what books are made of',
						slug: 'paper',
						img_url: '',
					},
				]);
			});
	});
	test('200: Get articles by article_id', () => {
		return request(app)
			.get('/api/articles/3')
			.expect(200)
			.then(({ body: { article } }) => {
				expect(article).toBeInstanceOf(Object);
				expect(article.created_at).toMatch(
					/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
				);

				expect(article).toEqual({
					article_id: 3,
					title: 'Eight pug gifs that remind me of mitch',
					topic: 'mitch',
					author: 'icellusedkars',
					body: 'some gifs',
					created_at: '2020-11-03T09:12:00.000Z',
					votes: 0,
					article_img_url:
						'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
				});
			});
	});
	test('404: responds with an error when article_id does not exist', () => {
		return request(app)
			.get('/api/articles/9999')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('Article Not Found');
			});
	});
	test('400: responds with an error for invalid article_id (not a number)', () => {
		return request(app)
			.get('/api/articles/bananas')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Invalid Input');
			});
	});
	test('200: Get all articles, sorted by date in descending order', () => {
		return request(app)
			.get('/api/articles?sort_by=created_at')
			.expect(200)
			.then(({ body: { articles } }) => {
				expect(Array.isArray(articles)).toBe(true);
				expect(articles).not.toHaveLength(0);
				articles.forEach((article) => {
					expect(article).toEqual(
						expect.objectContaining({
							author: expect.any(String),
							title: expect.any(String),
							article_id: expect.any(Number),
							topic: expect.any(String),
							votes: expect.any(Number),
							article_img_url: expect.any(String),
							comment_count: expect.any(Number),
						})
					);
					expect(article.created_at).toMatch(
						/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
					);
					expect(articles).not.toHaveProperty('body');
					expect(articles).toBeSortedBy('created_at', { descending: true });
				});
			});
	});
	test('400: responds with error if sort_by is invalid', () => {
		return request(app)
			.get('/api/articles?sort_by=banana')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Invalid Sort Request');
			});
	});
	test('200: Get all comments, sorted by created_at in descending order', () => {
		return request(app)
			.get('/api/articles/1/comments')
			.expect(200)
			.then(({ body: { comments } }) => {
				expect(Array.isArray(comments)).toBe(true);
				expect(comments).not.toHaveLength(0);
				comments.forEach((comment) => {
					expect(comment.article_id).toEqual(1);
					expect(comment).toEqual(
						expect.objectContaining({
							comment_id: expect.any(Number),
							votes: expect.any(Number),
							author: expect.any(String),
							body: expect.any(String),
							article_id: expect.any(Number),
						})
					);
					expect(comment.created_at).toMatch(
						/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
					);

					expect(comments).toBeSortedBy('created_at', { descending: true });
				});
			});
	});
	test('404: responds with error if article_id is not found', () => {
		return request(app)
			.get('/api/articles/9999/comments')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('Article Not Found');
			});
	});
	test('400: responds with an error for invalid article_id (not a number)', () => {
		return request(app)
			.get('/api/articles/bananas/comments')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Invalid Input');
			});
	});
	test('200: responds if there are no comments yet for a valid article_id', () => {
		return request(app)
			.get('/api/articles/2/comments')
			.expect(200)
			.then(({ body }) => {
				expect(body.msg).toBe('No Comments ... Yet!');
			});
	});
});

describe('POST /api', () => {
	test('200: posts comment to correct article with correct values', () => {
		const article_id = 2;
		const body = 'First!!!!1!!one!one!!';
		const author = 'lurker';
		return request(app)
			.post(`/api/articles/${article_id}/comments`)
			.send({ body, author })
			.expect(201)
			.then(({ body: responseBody }) => {
				expect(responseBody.msg).toBe('Comment Posted Successfully');
				expect(responseBody.comment).toHaveProperty('article_id', article_id);
				expect(responseBody.comment).toHaveProperty('body', body);
				expect(responseBody.comment).toHaveProperty('author', author);
				expect(responseBody.comment).toHaveProperty('created_at');

				return db
					.query(`SELECT * from comments WHERE article_id= $1;`, [article_id])
					.then(({ rows }) => {
						expect(rows.length).toBe(1);
						expect(rows[0].body).toBe(body);
						expect(rows[0].created_at.toISOString()).toMatch(
							/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
						);
					});
			});
	});

	test('404: responds with error if article not found', () => {
		return request(app)
			.post('/api/articles/9999/comments')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('Article Not Found');
			});
	});

	test('400: responds with error if invalid article_id (not a number)', () => {
		return request(app)
			.post('/api/articles/bananas/comments')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad Request: article_id must be a number');
			});
	});
});
