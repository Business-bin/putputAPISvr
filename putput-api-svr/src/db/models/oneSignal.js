const mongoose = require('mongoose');
const { Schema } = mongoose;

const OneSignal = new Schema({
    aId:   String,
    aKey:   String
});

module.exports = mongoose.model('onesignals', OneSignal);