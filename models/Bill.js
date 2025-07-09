// models/Bill.js
const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNo: { type: String, unique: true },
  date: { type: Date, default: Date.now },
  tableNo: String,
  serverName: String,
  serverEmail: String,
  paymentMode: String,
  dishes: [
    {
      dishNo: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number
});

module.exports = mongoose.model('Bill', billSchema);
