const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['boutique', 'affiliate', 'model'] // Extend as needed
  },
  // Common Fields (shared by all roles)
  name: String,
  email: String,
  mobile: String,
  whatsapp: String,
  password: String,
  dashboard_email: String,
  temp_password: String,

  // Store & Pickup Info (Common)
  store_name: String,
  pickup_address_1: String,
  pickup_address_2: String,
  pincode: String,
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
  pickup_contact_person: String,
  pickup_phone: String,

  // Bank Details (Common)
  bank_account_holder: String,
  bank_account_number: String,
  ifsc_code: String,
  bank_name: String,
  cheque_or_passbook: String, // file path
  upi_id: String,

  //Boutique-Specific Fields
  boutique: {
    proprietor_name: String,
    business_type: String,
    gst_number: String,
    pan_number: String,
    document_type: String,
    document_front: String,
    document_back: String,
    registration_certificate: String,

    has_inventory: Boolean,
    source_from_zarkha: Boolean,
    margin_percent: Number,
    self_pricing_enabled: Boolean,
    return_policy: String,
    delivery_partner_preference: String,
    operating_days: [String],
    working_hours: {
      start: String,
      end: String
    },
    custom_branding_enabled: Boolean,
    agreement_accepted: Boolean,
    digital_signature: String,
    store_logo: String,
    social_links: {
      instagram: String,
      facebook: String
    }
  },

  // Extend here for other roles if needed:
  // affiliate: {...}
  // model: {...}

  created_at: { type: Date, default: Date.now },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
   // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }

});

module.exports = mongoose.model('Partner', PartnerSchema);
