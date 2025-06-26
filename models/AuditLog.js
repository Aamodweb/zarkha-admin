const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuditLogSchema = new Schema({
  action: { type: String, required: true }, // e.g., "create", "update", "delete"
  entity_type: { type: String, required: true }, // e.g., "Partner", "Product"
  entity_id: { type: Schema.Types.ObjectId, required: true },
  entity_name: { type: String }, // e.g., Partner name
  old_value: { type: Object, default: {} }, // previous state (on update)
  new_value: { type: Object, default: {} }, // new state (on create/update)
  remarks: { type: String },
  created_at: { type: Date, default: Date.now },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
