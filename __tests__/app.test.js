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
	test.only('200: Responds with an array of all topics', () => {
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
});
