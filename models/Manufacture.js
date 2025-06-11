// models/Manufacturer.js
const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  // Basic Details
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner_proprietor_name: {
    type: String,
    trim: true
  },
  business_type: {
    type: String
  },
  business_name: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    match: [/^\d{10}$/, 'Mobile number must be 10 digits']
  },
  whatsapp_mobile: {
    type: String
  },
  contact_email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  website: {
    type: String
  },
  gst_number: {
    type: String
  },
  pan_number: {
    type: String
  },
  msme_regisration: {
    type: String,
    default: null
  },

  // Images and Documents
  image: {
    type: String,
    default: null
  },
  business_registration_certificate: {
    type: String,
    default: null
  },

  // Address Section
  state_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  pincode: {
    type: String
  },
  address: {
    type: String
  },

  // Bank Details
  account_holder_name: {
    type: String,
    required: true
  },
  bank_account_number: {
    type: String,
    required: true
  },
  bank_ifsc_code: {
    type: String,
    required: true
  },
  bank_name: {
    type: String,
    required: true
  },
  cancelled_cheque_passbook: {
    type: String,
    required: true
  },
  upi_id: {
    type: String,
    default: null
  },

  // Industry (Multiple)
  industry_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry',
      required: true
    }
  ],

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }

}, { timestamps: true });

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
