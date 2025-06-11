const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
    name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  currencies: {
    type: String,
    required: false,
     default: '',
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Country', CountrySchema,'countries');