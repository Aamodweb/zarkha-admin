// models/Subcategory.js
const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
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
  },
  seo: {
  meta_title: String,
  meta_description: String,
  meta_keywords: String,
  canonical_url: String,
},
hash_tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hashtag' }],
created_at: {
  type: Date,
  default: Date.now
},
updated_at: {
  type: Date
},
}, { timestamps: true });

module.exports = mongoose.model('Subcategory', SubcategorySchema);
