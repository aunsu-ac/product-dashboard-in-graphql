const mongoose = require('mongoose');

const lo_categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  logo: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', lo_categorySchema);
