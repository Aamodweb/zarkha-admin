const mongoose = require('mongoose');

const ColorImageSchema = new mongoose.Schema({
  color: String,
  images: [String]
});

module.exports = ColorImageSchema;
