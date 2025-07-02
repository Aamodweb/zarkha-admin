const mongoose = require('mongoose');

const AttributeTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Color", "Size"
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AttributeType', AttributeTypeSchema);