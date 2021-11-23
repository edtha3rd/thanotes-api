//provide resolver functions for our schema fields

module.exports = {
    notes: async (parent, args, { models }) => {
        return await models.Note.find().limit(100);
    },
    note: async (parent, args, { models }) => {
        return await models.Note.findById(args.id);
    },
    user: async (parent, args, { models }) => {
        //find a user given their username
        return await models.User.findOne({ username: args.username });
    },
    users: async (parent, args, { models }) => {
        //find all users
        return await models.User.find({});
    },
    me: async (parent, args, { models, user }) => {
        //find a user given the current user context
        return await models.User.findById(user.id);
    },
    NoteFeed: async (parent, { cursor }, { models }) => {
        //hardcode the limit to 10 items
        const limit = 10;
        //set the default hasNextPage to false
        let hasNextPage = false;
        //if no cursor passed default query will be empty
        //this will pull the newest notes from db
        let cursorQuery = {};
        //if there is a cursor
        //our query will look for notes with an ObjectId less than the cursor
        if (cursor) {
            cursorQuery = { _id: { $lt: cursor } };
        }
        //find the limit + 1 of notes in our db, newest to oldest
        let notes = await models.Note.find(cursorQuery)
            .sort({ _id: -1 })
            .limit(limit + 1);
        
        // if the number of notes exceeds the limit
        //set hasNextPage to true and trim notes to limit
        if (notes.length > limit) {
            hasNextPage = true;
            notes = notes.slice(0, -1);
        }
        //the new cursor will be the Mongo object ID of the last item in the feed array
        const newCursor = notes[notes.length - 1]._id;

        return {
            notes,
            cursor: newCursor,
            hasNextPage
        };
    }
}