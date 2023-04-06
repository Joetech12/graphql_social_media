const { ApolloServer, PubSub } = require('apollo-server');
// const { PubSub } = require('graphql-subscriptions');
const gql = require('graphql-tag');
const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

// const pubsub = new PubSub();

const { MONGODB } = require('./config.js');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;
const objectTypeDefs = require('./graphql/typeDefs.js');
const typeResolvers = require('./graphql/resolvers');

const server = new ApolloServer({
  typeDefs: objectTypeDefs,
  resolvers: typeResolvers,
  context: ({ req }) => ({ req }),
});

// Connect to database
connectDB();

server.listen(port, console.log(`Server running on port ${port}`));
