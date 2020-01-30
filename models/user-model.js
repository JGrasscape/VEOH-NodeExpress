const mongoose = require('mongoose'); // terminal: npm install mongoose
const Schema = mongoose.Schema;

const user_schema = new Schema({
    name: {
        type: String,
        required: true
    },
    notes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'note', // Viittaus toiseen 'tauluun'
        required: true
    }]
});
const user_model = mongoose.model('user', user_schema);

module.exports = user_model;