const AuditLog = require('../models/AuditLog');

const logAudit = async ({
  action,
  entity_type,
  entity_id,
  entity_name,
  old_value = {},
  new_value = {},
  remarks = '',
  user_id
}) => {
  /**
   * Create an audit log entry
   * @param {string} action - e.g., 'create', 'update', 'delete'
   * @param {string} entity_type - e.g., 'Partner', 'Product'
   * @param {ObjectId} entity_id - MongoDB _id of the entity
   * @param {string} entity_name - Display name of the entity
   * @param {Object} [old_value={}] - Previous state (for updates)
   * @param {Object} [new_value={}] - New state (for create/update)
   * @param {string} [remarks=''] - Optional description
   * @param {ObjectId} user_id - ID of the admin/user performing the action
   */
  try {
    await AuditLog.create({
      action,
      entity_type,
      entity_id,
      entity_name,
      old_value,
      new_value,
      remarks,
      user_id,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = {
  logAudit
};
