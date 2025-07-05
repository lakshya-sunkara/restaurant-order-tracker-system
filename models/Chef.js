const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialty: String,
  phone: String,
  gender: String,
  
  image: String,
  chefId: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  joinDate: {
    type: Date,
    default: Date.now // 👈 Automatically records the time of creation
  }
});

module.exports = mongoose.model('Chef', chefSchema);
