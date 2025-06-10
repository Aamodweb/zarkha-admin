// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  industry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
