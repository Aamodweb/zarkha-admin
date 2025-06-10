const mongoose = require('mongoose');

const IndustrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  status: String, // e.g., 'active', 'inactive'
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Industry', IndustrySchema);
