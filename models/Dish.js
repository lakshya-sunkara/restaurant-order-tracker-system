const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  dishNo: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Soups',
      'Starters',
      'Biryani',
      'Meals',
      'Veg Meals',
      'Soft Drinks / Juices',
      'Roti',
      'Breads',
      'Desserts'
    ]
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String, // store image filename (e.g., "paneer_butter.jpg")
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dish', dishSchema);
