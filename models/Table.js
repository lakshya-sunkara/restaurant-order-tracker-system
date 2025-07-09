const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNo: { type: String, unique: true },
  status: {
    type: String,
    enum: ['empty', 'taking', 'waiting', 'preparing', 'delivered'],
    default: 'empty'
  },
  serverEmail: String,
  serverName: String,
  serverImage: String,
  orderStartTime: Date,

  food: [
    {
      dishNo: { type: String },  // ✅ Changed from dishId (ObjectId) to dishNo (String)
      quantity: Number
    }
  ],
  orderedFood: [
    {
      dishNo: { type: String },  
      quantity: Number
    }
  ],
});

module.exports = mongoose.model('Table', tableSchema);
