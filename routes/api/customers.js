const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');

const Customer = require('../../models/Customer');
const Account = require('../../models/Account');
const auth = require('../../middleware/auth');

// @route  POST api/customers
// @desc   register customer
// @access public

router.post(
  '/',
  [
    check('name', 'Please enter a valid name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let error = {};
      errors.array().forEach((err) => {
        error[err.param] = err.msg;
      });
      return res.status(400).json({ error });
    }

    const { name, email, password } = req.body;
    try {
      // Customer exists
      let isCustomer = await Customer.findOne({ email });
      if (isCustomer) {
        return res.status(400).send({ msg: 'Customer already exists' });
      }

      let customer = new Customer({
        name,
        email,
        password,
      });

      // Bcrypt password
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(password, salt);
      await customer.save();

      // return jsonWebToken
      const payload = {
        customer: {
          id: customer.id,
        },
      };

      jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  GET api/customers
// @desc   get customer
// @access public

router.get('/', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select(
      '-password'
    ); // remmove password from data string

    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  Delete api/customer
// @desc   Delete customer
// @access private

router.delete('/', auth, async (req, res) => {
  try {
    // Remove customer
    const customer = await Customer.findByIdAndRemove(req.customer.id).select(
      '-password'
    ); // remove password from data string

    const account = await Account.findOneAndRemove({
      customer: req.customer.id,
    });
    if (!customer || !account)
      return res.status(400).json({ msg: 'Account not found' });

    res.json({ msg: 'Customer Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
