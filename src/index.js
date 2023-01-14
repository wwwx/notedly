const express = require('express');
const jwt = require('jsonwebtoken');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolves');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();

db.connect(DB_HOST);

const getUser = token => {
  if (token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Session invalid');
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization;
    console.log(token);
    const user = getUser(token);
    console.log(user);
    return { models, user };
  }
});

server.applyMiddleware({ app, path: '/api' });

app.listen(port, () =>
  console.log(`GraphQL Server running at http://localhost:${port}`)
);
