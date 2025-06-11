const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  state_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true
    },
    name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: false,
    default:'',
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('City', CitySchema);