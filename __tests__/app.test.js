const endpointsJson = require('../endpoints.json');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const request = require('supertest');
const app = require('../app.js');

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
				expect(body.msg).toBe('Invalid Article ID');
			});
	});
	// 	test('200: Get all articles, sorted by date in descending order', () => {
	// 		return request(app)
	// 			.get('/api/articles?sort_by=created_at')
	// 			.expect(200)
	// 			.then(({ body: { articles } }) => {
	// 				expect(articles).toBeInstanceOf(Array);
	// 				articles.forEach((article) => {
	// 					expect(article).toEqual(
	// 						expect.objectContaining({
	// 							author: expect.any(String),
	// 							title: expect.any(String),
	// 							article_id: expect.any(Number),
	// 							topic: expect.any(String),
	// 							votes: expect.any(Number),
	// 							article_img_url: expect.any(String),
	// 						})
	// 					);
	// 					expect(article.created_at).toMatch(
	// 						/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
	// 					);
	// 					expect(articles).toBeSortedBy('created_at', { descending: true });
	// 				});
	// 			});
	// 	});
	// 	test('400: responds with error if sort_by is invalid', () => {
	// 		return request(app)
	// 			.get('/api/articles?sort_by=banana')
	// 			.expect(400)
	// 			.then(({ body: { articles } }) => {
	// 				expect(articles).toEqual([]);
	// 			});
	// 	});
});
