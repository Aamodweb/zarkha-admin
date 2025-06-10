const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  attribute_name: String,
  attribute_value: String,
  product_price: Number,
  discount_price: Number,
  product_stock: Number,
  product_sku: String
});

module.exports = VariantSchema;
