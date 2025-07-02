const mongoose = require('mongoose');
const ProductImageSchema = new mongoose.Schema({
  image_path: { type: String, required: true },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // optional
  uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductImage', ProductImageSchema);
