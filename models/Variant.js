const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  attribute_name: String,
  attribute_value: String,
  product_price: Number,
  discount_price: Number,
  product_stock: Number,
  product_sku: String,
  color_code: String,
  image_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductImage' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Variant', VariantSchema);
