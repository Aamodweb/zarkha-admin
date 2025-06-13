const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },

  // Discount Info
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discount_value: {
    type: Number,
    required: true,
  },
  max_discount_amount: {
    type: Number,
    default: null, // applicable for percentage type
  },
  min_cart_value: {
    type: Number,
    default: 0,
  },

  // Usage Limits
  total_uses: {
    type: Number,
    default: 0,
  },
  max_uses: {
    type: Number,
    default: 1,
  },
  max_uses_per_user: {
    type: Number,
    default: 1,
  },

  // Apply Scope (All or Specific)
  apply_scope: {
    type: String,
    enum: ['all', 'specific'],
    default: 'all',
  },

  // Applicable types (if specific)
  applicable_to: [{
    type: String,
    enum: ['product', 'category', 'vendor', 'brand'],
  }],

  applicable_ids: {
    product: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    category: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    // vendor: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User' // or 'Vendor'
    // }],
    brand: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brands'
    }]
  },

  // Creator Info
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser', // Admin or Vendor
    required: true,
  },

  // Validity
  start_date: {
    type: Date,
    default: Date.now,
  },
  end_date: {
    type: Date,
    required: true,
  },

    image: {
        type: String,
        default: ''
    },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
  },
  

  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', CouponSchema);
