const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer',
  },
  accountNumber: {
    type: String,
    default: function () {
      var my_string = '' + Math.floor(Math.random() * 999);
      while (my_string.length < 4) {
        my_string = '0' + my_string;
      }
      return my_string;
    },
    index: { unique: true },
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = Account = mongoose.model('account', AccountSchema);
