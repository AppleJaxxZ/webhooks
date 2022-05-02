const mongoose = require('mongoose');
const { Schema } = mongoose;


const testSchema = new Schema({

    name: {
        type: String,

    },
    email: {
        type: String,
    },
    dateOfBirth: {
        type: String,

    },

    phoneNumber: {
        type: String,

    },
},
    { collection: "test" }
);


module.exports = mongoose.model('Test', testSchema);
