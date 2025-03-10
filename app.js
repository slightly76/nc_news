const express = require('express');
const app = express();
const {
	getEndpoints,
	getAllTopics,
} = require('./controller/get.controller.js');

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getAllTopics);

module.exports = app;
