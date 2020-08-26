const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  fromAccount: {
    type: String,
  },
  toAccount: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = Transaction = mongoose.model('transaction', TransactionSchema);
