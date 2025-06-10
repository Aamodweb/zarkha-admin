// models/Manufacturer.js
const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    required: true
  },
  address: {
    type: String
  },
  contact_email: {
    type: String
  },
  image: {
            type: String,
            default: ''
    },
  mobile: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
