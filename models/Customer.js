const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    default: function () {
      var my_string = '' + Math.floor(Math.random() * 999);
      while (my_string.length < 3) {
        my_string = '0' + my_string;
      }
      return my_string;
    },
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = Customer = mongoose.model('customer', CustomerSchema);
