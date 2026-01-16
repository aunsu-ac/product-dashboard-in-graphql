const mongoose = require('mongoose');

const lo_brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  country: {
    type: String,
  },
  website: {
    type: String,
  },
  logo: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Brand', lo_brandSchema);
