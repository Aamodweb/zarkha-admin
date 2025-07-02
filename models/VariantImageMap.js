const mongoose = require('mongoose');
const VariantImageMapSchema = new mongoose.Schema({
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
  image_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductImage' }
});

module.exports = mongoose.model('VariantImageMap', VariantImageMapSchema);
