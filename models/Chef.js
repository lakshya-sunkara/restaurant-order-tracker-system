const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialty: String,
  phone: String,
  gender: String,
  dateOfBirth: Date,
  image: String,
  joinDate: {
    type: Date,
    default: Date.now // 👈 Automatically records the time of creation
  }
});

module.exports = mongoose.model('Chef', chefSchema);
