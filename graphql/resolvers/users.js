const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput } = require('../../utils/validators');
const { validateLoginInput } = require('../../utils/validators');
const User = require('../../models/User');
const SECRET_KEY = process.env.SECRET_KEY;

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

module.exports = {
  Query: {
    async getUsers() {
      try {
        const users = await User.find();
        return users;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    async login(_, { username, password }) {
      const { errors, isValid } = validateLoginInput(username, password);

      if (!isValid) {
        throw new UserInputError('Errors', { errors });
      }

      const user = await User.findOne({ username });
      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Incorrect Password';
        throw new UserInputError('Incorrect Password', { errors });
      }
      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },

    async register(
      _,
      { registerInput: { email, username, password, confirmPassword } },
      context,
      info
    ) {
      // TODO: validate user data
      const { isValid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!isValid) {
        throw new UserInputError('Errors', { errors });
      }

      // TODO: make sure user doesn't already exist
      const user = await User.findOne({ username });
      const userEmail = await User.findOne({ email });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken',
          },
        });
      } else if (userEmail) {
        throw new UserInputError('Email is taken', {
          errors: {
            email: 'This email is taken',
          },
        });
      }

      // TODO: hash password and create an auth token
      password = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
