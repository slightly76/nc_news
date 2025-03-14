const ENV = process.env.NODE_ENV || 'development';

const { Pool } = require('pg');

require('dotenv').config({ path: `${__dirname}/../.env.${ENV}` });

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
	throw new Error('No PGDATABASE pr database_url configured');
} else {
	console.log(`Connected to ${process.env.PGDATABASE}`);
}

const config = {};

if (ENV === 'production') {
	config.connectionString = process.env.DATABASE_URL;
	config.max = 2;
}

const db = new Pool(config);

module.exports = db;
