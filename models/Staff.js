const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  gender: String,
  address: String,
  image: String, // store filename or image URL
  staffId: { type: String, unique: true, default: () => 'SID' + Date.now() },

  // ✅ New fields
  dateOfBirth: Date,
  dateOfJoining: { type: Date, default: Date.now }, // auto-filled when staff is added

  accountDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String
  }
});

module.exports = mongoose.model('Staff', staffSchema);
