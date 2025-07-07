const mongoose = require('mongoose');

const chefAuthSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String, // hashed password
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('chefAuth', chefAuthSchema);
