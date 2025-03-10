const express = require('express');
const app = express();
const request = 'supertest';
const db = require('./db/connection.js');
const endpoints = require('./endpoints.json');
const { getEndpoints } = require('./controller/get.controller.js');

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

module.exports = app;
