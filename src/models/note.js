//require mongoose lib
const mongoose = require('mongoose');
//define note's db schema
const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    favoriteCount: {
        type: Number,
        default: 0
    },
    favoritedBy: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        }
    ]
    },
    {
        //assigns createdAt and updatedAt fileds with a Date type
        timestamps: true
    }
);
//define the 'note' model with the schema
const Note = mongoose.model('Note', noteSchema);
//EXport the model
module.exports = Note;
