const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError } = 'apollo-server-express';

require('dotenv').config();

module.exports = {
  newNote: async (parent, args, { models }) => {
    const note = new models.Note({
      content: args.content,
      author: 'Wally'
    });
    return await note.save();
  },
  deleteNote: async (parent, { id }, { models }) => {
    try {
      await models.Note.findOneAndRemove({ _id: id });
      return true;
    } catch (err) {
      return false;
    }
  },
  updateNote: async (parent, { id, content }, { models }) => {
    return await models.Note.findOneAndUpdate(
      { _id: id },
      { $set: { content } },
      { new: true }
    );
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const avatar = ''; // TODO

    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      });

      const secret = process.env.JWT_SECRET;
      // console.log('secret=======>', secret);

      return await jwt.sign({ id: user._id }, secret);
    } catch (err) {
      // console.log(err);
      throw new Error('Error creating acount');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    // console.log('email=======>', email);

    const user = await models.User.findOne({
      $or: [{ email }, { username }]
    });

    // console.log('!user=======>', !user);

    if (!user) {
      throw new AuthenticationError('Error signing in');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Error signing in');
    }

    const secret = process.env.JWT_SECRET;
    // console.log('secret=======>', secret);

    return await jwt.sign({ id: user._id }, secret);
  }
};
