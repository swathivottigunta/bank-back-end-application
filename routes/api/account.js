const express = require('express');
const config = require('config');

const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const moment = require('moment');

// Modal
const Account = require('../../models/Account');
const Customer = require('../../models/Customer');
const Transaction = require('../../models/Transaction');

const convertToCAD = require('../../utils/utilities');

// @route  Post api/account/
// @desc   add account
// @access private

router.post('/', auth, async (req, res) => {
  const accountfields = {};
  accountfields.customer = req.customer.id;
  try {
    //Create
    let account = new Account(accountfields);
    await account.save();
    let createdAccount = await Account.findById(
      account._id
    ).populate('customer', ['name', 'email']);
    res.json(createdAccount);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/account/me
// @desc   Get current customers account
// @access private

router.get('/me', auth, async (req, res) => {
  try {
    const account = await Account.find({
      customer: req.customer.id,
    }).populate('customer', ['name', 'email']);

    if (!account) res.status(400).json({ msg: 'No Account found' });
    else res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// // @route  GET api/account/:account_id
// // @desc   Get accounts by customers
// // @access public

router.get('/:accountNumber', auth, async (req, res) => {
  try {
    const account = await Account.findOne({
      accountNumber: req.params.accountNumber,
    }).populate('customer', ['name', 'email']);

    if (!account) return res.status(400).json({ msg: 'Account not found' });

    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/account/deposit/:accountNumber
// @desc   Deposit the amount by accountNumber
// @access private

router.put(
  '/deposit/:accountNumber',
  [
    auth,
    [
      check('amount', 'Please enter the valid number').not().isEmpty(),
      check('currency', 'Please select the currency of the amount to deposit')
        .not()
        .isEmpty(),
      check('currency', 'Invalid Currency').isIn(['CAD', 'MXN', 'USD']),
    ],
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

    const session = await Customer.startSession();
    session.startTransaction();
    try {
      const opts = { session };
      let { amount, currency } = req.body;

      let convertedAmount;
      convertedAmount = convertToCAD(amount, currency);

      const account = await Account.findOneAndUpdate(
        { accountNumber: req.params.accountNumber },
        { $inc: { balance: convertedAmount } },
        opts
      );
      if (!account) return res.status(400).json({ msg: 'Account not found' });

      let transaction = new Transaction({
        toAccount: req.params.accountNumber,
        amount: convertedAmount,
        type: 'deposit',
        date: moment().format('YYYY-MM-DD hh:mm:ss'),
      });

      await transaction.save(opts);
      await session.commitTransaction();
      session.endSession();

      const updatedAccount = await Account.findOne({
        accountNumber: req.params.accountNumber,
      });
      res.json(updatedAccount);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  PUT api/account/withdraw/:accountNumber
// @desc   Withdraw the amount by accountNumber
// @access private

router.put(
  '/withdraw/:accountNumber',
  [
    auth,
    [
      check('amount', 'Please enter the valid number').not().isEmpty(),
      check('currency', 'Please select the currency of the amount to withdraw')
        .not()
        .isEmpty(),
      check('currency', 'Invalid Currency').isIn(['CAD', 'MXN', 'USD']),
    ],
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
    const session = await Customer.startSession();
    session.startTransaction();
    try {
      const opts = { session };
      let { amount, currency } = req.body;

      let convertedAmount;
      convertedAmount = convertToCAD(amount, currency);

      const account = await Account.findOne({
        accountNumber: req.params.accountNumber,
      });
      if (!account) return res.status(400).json({ msg: 'Account not found' });

      if (account.balance - convertedAmount >= 0)
        account.balance = account.balance - convertedAmount;
      else
        return res
          .status(400)
          .json({ msg: 'Insufficient balance to withdraw' });

      await account.save(opts);

      let transaction = new Transaction({
        toAccount: req.params.accountNumber,
        amount: convertedAmount,
        type: 'withdraw',
        date: moment().format('YYYY-MM-DD hh:mm:ss'),
      });

      await transaction.save(opts);

      await session.commitTransaction();
      session.endSession();

      const updatedAccount = await Account.findOne({
        accountNumber: req.params.accountNumber,
      });
      res.json(updatedAccount);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
// @route  PUT api/account/transfer/:accountNumber
// @desc   Transfer the amount to another account
// @access private

router.put(
  '/transfer/:accountNumber',
  [
    auth,
    [
      check('amount', 'Please enter the valid number').not().isEmpty(),
      check('currency', 'Please select the currency of the amount to transfer')
        .not()
        .isEmpty(),
      check(
        'toAccountNumber',
        'Please select the account number to transfer the money'
      )
        .not()
        .isEmpty(),
      check('currency', 'Invalid Currency').isIn(['CAD', 'MXN', 'USD']),
    ],
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
    const session = await Customer.startSession();
    session.startTransaction();
    try {
      const opts = { session };
      let { toAccountNumber, amount, currency } = req.body;
      let fromAccountNumber = req.params.accountNumber;

      let convertedAmount;
      convertedAmount = convertToCAD(amount, currency);

      const fromAccount = await Account.findOne({
        accountNumber: fromAccountNumber,
      });
      if (!fromAccount)
        return res
          .status(400)
          .json({ msg: 'Account does not exist to withdraw' });
      const toAccount = await Account.findOne({
        accountNumber: toAccountNumber,
      });
      if (!toAccount)
        return res
          .status(400)
          .json({ msg: 'Account does not exist to deposit' });

      if (fromAccount.balance - convertedAmount >= 0)
        fromAccount.balance = fromAccount.balance - convertedAmount;
      else
        return res
          .status(400)
          .json({ msg: 'Insufficient balance to transfer' });

      await fromAccount.save(opts);

      toAccount.balance = toAccount.balance + convertedAmount;
      await toAccount.save(opts);

      let transaction = new Transaction({
        fromAccount: fromAccountNumber,
        toAccount: toAccountNumber,
        amount: convertedAmount,
        type: 'transfer',
        date: moment().format('YYYY-MM-DD hh:mm:ss'),
      });

      await transaction.save(opts);

      await session.commitTransaction();
      session.endSession();

      const debit = await Account.findOne({
        accountNumber: fromAccountNumber,
      });
      const credit = await Account.findOne({
        accountNumber: toAccountNumber,
      });

      res.json({ debit, credit });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
