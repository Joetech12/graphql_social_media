const { ApolloServer } = require('apollo-server');
const gql = require('graphql-tag');
const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

const { MONGODB } = require('./config.js');
const Post = require('./models/Post.js');
const User = require('./models/User.js');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;

const objectTypeDefs = gql`
  type Post {
    id: ID!
    body: String!
    username: String!
    createdAt: String!
  }
  type Query {
    getPosts: [Post]
  }
`;

const typeResolvers = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find();
        return posts;
      } catch (error) {
        console.log(error);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs: objectTypeDefs,
  resolvers: typeResolvers,
});

// Connect to database
connectDB();

server.listen(port, console.log(`Server running on port ${port}`));

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB Connected');
//     return server.listen({ port: 5000 });
//   })
//   .then(({ url }) => {
//     console.log(`Server running at ${url}`);
//   });
