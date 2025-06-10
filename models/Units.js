// models/Units.js
const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  short_name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'active'
  },
   created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Unit', UnitSchema);
