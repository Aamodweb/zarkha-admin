const mongoose = require('mongoose');

const StateSchema = new mongoose.Schema({
  country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true
    },
    name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('State', StateSchema);