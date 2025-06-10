const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminUserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  created_at: Date,
  status: String
});

// Hash password before save
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
adminUserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to create/store new admin user
adminUserSchema.statics.store = async function(data) {
  const user = new this(data);
  return user.save();
};

// Static method to find admin users (with filter)
adminUserSchema.statics.findUsers = function(filter = {}) {
  return this.find(filter).exec();
};

// Static method to find one user by id
adminUserSchema.statics.findByIdUser = function(id) {
  return this.findById(id).exec();
};

// Static method to update a user by id
adminUserSchema.statics.updateUser = function(id, data) {
  return this.findByIdAndUpdate(id, data, { new: true }).exec();
};

// Static method to delete a user by id
adminUserSchema.statics.deleteUser = function(id) {
  return this.findByIdAndDelete(id).exec();
};

const AdminUser = mongoose.model('AdminUser', adminUserSchema, 'admin_user');

module.exports = AdminUser;
