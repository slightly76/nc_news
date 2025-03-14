# NC News API

link [here](http://www.bbc.co.uk)

## -= Project Overview =-

The NC News API is a RESTful API built using Node.js, Express.js and PostgreSQL. It serves as a backend for a Northcoders News website which allows users to;

- retrieve articles, topics and comments
- sort and filter articles
- post new comments
- upvote or downvote articles

This project is designed for developers to interact with using HTTP requests such as api/articles/:article_id etc.

## -= Setup Instructions =-

Create the following files in the _root_ of your project;

### Clone the *repo*sitory from GitHub

`git clone https://github.com/slightly76/nc_news` \
`cd nc-news`

### Install Dependencies

Ensure you have node.js and PostgreSQL installed, then run
npm install.

### Setup Environment Variables

Create the .env.test file

- create .env.test
- add `PGDATABASE=nc_news_test`

Create .env.development file

- create .env.development
- add `PGDATABASE=nc_news`

### Setup and Seed the Database

`npm run setup-dbs` \
`npm run seed`

### Run the API locally

Start the development server with `npm run dev`.

The API will be available at; http://localhost:9090/api

### Runing the Tests

Run the test suite with `npm test`
