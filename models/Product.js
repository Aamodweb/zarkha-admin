const mongoose = require('mongoose');
const VariantSchema = require('./Variant');
const ColorImageSchema = require('./ColorImage');

const ProductSchema = new mongoose.Schema({
  industry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brands'
  },
  name: { type: String, required: true },
  description: { type: String },

  image_type: {
    type: String,
    enum: ['color', 'general'],
    default: 'color'
  },

  has_variants: {
    type: String,
    default: 'no'
  },

  // If image_type === 'color'
  color_images: [ColorImageSchema],

  variants: [VariantSchema],

  return_allowed: {
    type: String,
    enum: ['yes', 'no'],
    default: 'yes'
  },
  return_notes: { type: String },

  seo_title: { type: String },
  seo_description: { type: String },
  product_tags: [String], // Store as array of keywords

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);