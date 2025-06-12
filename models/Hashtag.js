// models/Hashtag.js
const mongoose = require('mongoose');

const HashtagSchema = new mongoose.Schema({
   name: {
    type: String,
    required: true,
    unique: true, // ensures no duplicate hashtags
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Hashtag', HashtagSchema);
