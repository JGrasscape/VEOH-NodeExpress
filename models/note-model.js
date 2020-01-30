const mongoose = require('mongoose'); // terminal: npm install mongoose
const Schema = mongoose.Schema;

const note_schema = new Schema({
    text: {
        type: String,
        required: true
    }
});
const note_model = mongoose.model('note', note_schema);

module.exports = note_model;