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
				expect(body.msg).toBe('Bad Request');
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
	test('201: posts comment to correct article with correct values', () => {
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
						expect(rows[0].article_id).toBe(2);
						expect(rows[0].created_at.toISOString()).toMatch(
							/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
						);
					});
			});
	});

	test('201: ignores unnecessary properties on comment request body', () => {
		const article_id = 2;
		const validComment = {
			body: 'First!!!!1!!one!one!!',
			author: 'lurker',
			unnecessaryProperty: 'spong-wiggidy!',
		};
		return request(app)
			.post(`/api/articles/${article_id}/comments`)
			.send(validComment)
			.expect(201)
			.then(({ body: responseBody }) => {
				expect(responseBody.msg).toBe('Comment Posted Successfully');
				expect(responseBody.comment).toHaveProperty('article_id', article_id);
				expect(responseBody.comment).toHaveProperty('body', validComment.body);
				expect(responseBody.comment).toHaveProperty(
					'author',
					validComment.author
				);
				expect(responseBody.comment).toHaveProperty('created_at');
				expect(responseBody.comment).not.toHaveProperty('unnecessaryProperty');
			});
	});

	test("404: responds with error when posting a comment from username that doesn't exist", () => {
		const article_id = 2;
		const invalidUserComment = {
			body: 'I can write NEthing here. Phear me.',
			author: 'AMitchInTimeSavesNine',
		};
		return request(app)
			.post(`/api/articles/${article_id}/comments`)
			.send(invalidUserComment)
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('User Not Found');
			});
	});

	test('404: responds with error if article not found', () => {
		const body = 'First!!!!1!!one!one!!';
		const author = 'lurker';
		return request(app)
			.post('/api/articles/999999999/comments')
			.send({ body, author })
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
				expect(body.msg).toBe('Bad Request');
			});
	});
});

describe('PATCH /api', () => {
	test('202: patches an article successfully with the correct number of votes when positive', async () => {
		const article_id = 4;
		const newVotes = 50;
		try {
			const { body: responseBody } = await request(app)
				.patch(`/api/articles/${article_id}`)
				.send({ inc_votes: newVotes })
				.expect(202);
			expect(responseBody).toHaveProperty('article');
			expect(responseBody.article).toHaveProperty('votes');
			expect(responseBody.msg).toBe('Votes Updated Successfully');
			expect(responseBody.article.votes).toBe(50);
		} catch (err) {
			throw err;
		}
	});
	test('400: responds with error when no inc_votes value is provided', async () => {
		const article_id = 1;
		try {
			const { body: responseBody } = await request(app)
				.patch(`/api/articles/${article_id}`)
				.send({});
			expect(400);
			expect(responseBody.msg).toBe('Bad Request');
		} catch (err) {
			throw err;
		}
	});
	test('404: responds with error if article not found', async () => {
		const article_id = 9999999;
		const newVotes = 50;
		try {
			const { body: responseBody } = await request(app)
				.patch(`/api/articles/${article_id}`)
				.send({ inc_votes: newVotes });
			expect(404);
			expect(responseBody.msg).toBe('Article Not Found');
		} catch (err) {
			throw err;
		}
	});
	test('400: responds with error if invalid article_id (not a number)', () => {
		const article_id = 'banana';
		const newVotes = 99;
		return request(app)
			.patch(`/api/articles/${article_id}`)
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad Request');
			});
	});

	test('400: responds with error if newVote is not a number', () => {
		const article_id = 3;
		const newVotes = 'banana';
		return request(app)
			.patch(`/api/articles/${article_id}`)
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad Request');
			});
	});
});

describe('DELETE /api', () => {
	test('204: successfully removes a comment by comment_id', async () => {
		const comment_id = 3;
		try {
			const deletedComment = await request(app)
				.delete(`/api/comments/${comment_id}`)
				.expect(204);
			const { rows } = await db.query(
				`SELECT * from comments WHERE comment_id = $1`,
				[comment_id]
			);
			expect(rows.length).toBe(0);
		} catch (err) {
			throw err;
		}
	});
	test('400: returns error if comment_id is invalid (not a number)', async () => {
		const comment_id = 'banana';
		try {
			const { body } = await request(app)
				.delete(`/api/comments/${comment_id}`)
				.expect(400);
			expect(body.msg).toBe('Bad Request');
		} catch (err) {
			throw err;
		}
	});
	test(`404: returns error if comment_id is valid but comment doesn't exist`, async () => {
		const comment_id = 999999;
		try {
			const { body } = await request(app)
				.delete(`/api/comments/${comment_id}`)
				.expect(404);
			expect(body.msg).toBe('Not Found');
		} catch (err) {
			throw err;
		}
	});
});
