const { UserInputError } = require('apollo-server');
const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const user = checkAuth(context);
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body is required',
          },
        });
      }

      const post = await Post.findById(postId);

      if (post) {
          post.comments.unshift({
            body,
            username: user.username,
            createdAt: new Date().toISOString(),
          })
      }
    },
  },
};
