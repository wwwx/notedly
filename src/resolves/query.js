module.exports = {
  hello: () => 'Hello world!!!',
  notes: async (parent, args, { models }) => {
    new models.Note({ content: 'helloworld', author: 'Wally' }).save();
    // return [{ id: 2, content: 'Today is a nice day', author: 'Wally' }];
    return await models.Note.find();
  },
  note: async (parent, args, { models }) => {
    return await models.Note.findById(args.id);
  }
};
