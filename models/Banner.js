const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  subtitle: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: true  // path to image file
  },
  link: {
    type: String,
    required: false  // URL to redirect when banner is clicked
  },
  position: {
    type: String,
    enum: ['homepage', 'category', 'product', 'custom'],
    default: 'homepage'
  },
  sort_order: {
    type: Number,
    default: 0
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
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Banner', BannerSchema);
