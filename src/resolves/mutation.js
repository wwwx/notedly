const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');

require('dotenv').config();

module.exports = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note');
    }
    const note = new models.Note({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id)
    });

    return await note.save();
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }

    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError('You dont have permission to delete the note');
    }

    try {
      await note.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  updateNote: async (parent, { id, content }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be singed in to update a note');
    }

    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError('You dont have permission to update the note');
    }

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
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    //
    if (!user) {
      throw new AuthenticationError();
    }

    let noteCheck = models.Note.findById(id);
    console.log('favoritedBy=======>', noteCheck.favoritedBy);
    let hasUser = -1;

    if (noteCheck.favoritedBy) {
      hasUser = noteCheck.favoritedBy.indexOf(user.id);
    }

    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          new: true
        }
      );
    } else {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          new: true
        }
      );
    }
  }
};
