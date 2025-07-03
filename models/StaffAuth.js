const mongoose = require('mongoose');

const staffAuthSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String, // hashed password
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StaffAuth', staffAuthSchema);
