const mongoose = require('mongoose');

const AttributeValueSchema = new mongoose.Schema({
  type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributeType', required: true },
  value: { type: String, required: true }, // e.g., "Red", "XL"
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AttributeValue', AttributeValueSchema);