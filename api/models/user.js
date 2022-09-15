const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    _id: mongoose.Schema.Types.ObjectId,
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    email: { type: String, 
             required: true, 
             unique: true,
             match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            },
    password: { type: String, required: true },
    city:{type: String, required: true},
    state: {type: String, required: true}
});


module.exports = mongoose.model('User', userSchema);