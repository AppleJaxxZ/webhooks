const mongoose = require('mongoose');


const { Schema } = mongoose;

const subscriptionSchema = new Schema(
  {},
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
