const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Userdata' },
    title:  String ,
    content:   String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});



const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
