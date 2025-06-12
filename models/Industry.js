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
  },
   seo: {
      meta_title: String,
      meta_description: String,
      meta_keywords: String,
      canonical_url: String,
    },
    hash_tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hashtag' }],
});

module.exports = mongoose.model('Industry', IndustrySchema);
