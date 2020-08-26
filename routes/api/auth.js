const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Customer = require('../../models/Customer');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @route  post api/auth
// @desc   Customer login
// @access public

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
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

    const { email, password } = req.body;
    try {
      // customer exists , get the customer from the database
      let customer = await Customer.findOne({ email });
      if (!customer) {
        return res.status(400).send({ msg: 'Invalid credentials' });
      }

      // Compare paswword - plain and encrypted
      const isMatch = await bcrypt.compare(password, customer.password);

      if (!isMatch) {
        return res
          .status(400)
          .send({ errors: [{ msg: 'Invalid credentials' }] });
      }

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

module.exports = router;
