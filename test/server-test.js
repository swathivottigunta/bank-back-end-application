let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../server');
const { json } = require('express');

//Assertion Style
chai.should();
const assert = chai.assert;

chai.use(chaiHttp);
//POST /api/customers Register
//GET /api/customers Get registered customer using token
//POST /api/auth Login
//GET /api/account/:accountNumber Get account by accountNumber
//POST /api/account/ Add an account
//GET /api/account/me Get current accounts
//PUT /api/account/deposit/:accountNumber Deposit the amount to account
//PUT /api/account/withdraw/:accountNumber Withdraw the amount from account
//PUT /api/account/transfer/:accountNumber Transfer the amount from one account to another account
//DELETE api/customers

let token, toToken;
let customerParams = {
  name: 'swathi',
  email: 'swathi26891@gmail.com',
  password: 'swathi123',
};
let { name, email, password } = customerParams;
let account, toAccount;
let newBalance;

describe('API', () => {
  describe('POST api/customers', () => {
    it('it should get 400 response with no param', (done) => {
      chai
        .request(app)
        .post('/api/customers')
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body.error, ['email', 'name', 'password']);
          done();
        });
    });
    it('it should get 400 response with no name param', (done) => {
      chai
        .request(app)
        .post('/api/customers')
        .send({ email, password })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body.error, ['name']);
          done();
        });
    });
    it('it should get 400 response with no email param', (done) => {
      chai
        .request(app)
        .post('/api/customers')
        .send({
          name,
          password,
        })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body.error, ['email']);
          done();
        });
    });
    it('it should get 400 response with no password param', (done) => {
      chai
        .request(app)
        .post('/api/customers')
        .send({
          name,
          email,
        })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body.error, ['password']);
          done();
        });
    });
    it('it should get 200 response to register new user', (done) => {
      chai
        .request(app)
        .post('/api/customers')
        .send(customerParams)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          token = response.body.token;
          assert.hasAllKeys(response.body, ['token']);
          done();
        });
    });
    it('it should get 400 response to register existing user', (done) => {
      chai
        .request(app)
        .post('/api/customers')
        .send(customerParams)
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.equal(response.body.msg, 'Customer already exists');
          done();
        });
    });
  });
  describe('GET /api/customers', () => {
    it('it should get 401 response with incorrect token - get customer', (done) => {
      chai
        .request(app)
        .get('/api/customers')
        .set({ 'x-auth-token': 'noToken' })
        .end((err, response) => {
          response.should.have.status(401);
          assert.equal(response.body.msg, 'Token is not valid');
          done();
        });
    });
    it('it should get 200 response with correct token - get customer', (done) => {
      chai
        .request(app)
        .get('/api/customers')
        .set({ 'x-auth-token': token })
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body, [
            'name',
            'email',
            'customerId',
            '_id',
            '__v',
          ]);
          done();
        });
    });
  });
  describe('POST /api/auth', () => {
    it('it should get 400 response with no params to login', (done) => {
      chai
        .request(app)
        .post('/api/auth')
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body.error, ['email', 'password']);
          done();
        });
    });
    it('it should get 400 response with no password to login', (done) => {
      chai
        .request(app)
        .post('/api/auth')
        .send({ email })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body.error, ['password']);
          done();
        });
    });
    it('it should get 400 response with no email to login', (done) => {
      chai
        .request(app)
        .post('/api/auth')
        .send({ password })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body.error, ['email']);
          done();
        });
    });
    it('it should get 400 response with incorrect login details', (done) => {
      chai
        .request(app)
        .post('/api/auth')
        .send({ email: 'swathi268@gmail.com', password })
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a('object');
          assert.equal(response.body.msg, 'Invalid credentials');
          done();
        });
    });
    it('it should get 200 response to login', (done) => {
      chai
        .request(app)
        .post('/api/auth')
        .send({ email: 'swathi2689@gmail.com', password })
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body, ['token']);
          toToken = response.body.token;
          done();
        });
    });
  });
  describe('GET /api/account/:accountNumber', () => {
    it('it should get 401 response with incorrect token - get account by accountNumber', (done) => {
      chai
        .request(app)
        .get('/api/account/0796')
        .set({ 'x-auth-token': 'noToken' })
        .end((err, response) => {
          response.should.have.status(401);
          assert.equal(response.body.msg, 'Token is not valid');
          done();
        });
    });
    it('it should get 200 response - get account by accountNumber', (done) => {
      chai
        .request(app)
        .get('/api/account/0796')
        .set({ 'x-auth-token': toToken })
        .end((err, response) => {
          response.should.have.status(200);
          assert.hasAllKeys(response.body, [
            'customer',
            'accountNumber',
            'balance',
            '_id',
            '__v',
          ]);
          toAccount = response.body;
          done();
        });
    });
  });
  describe('POST /api/account', () => {
    it('it should get 401 response with incorrect token- add account', (done) => {
      chai
        .request(app)
        .post('/api/account')
        .set({ 'x-auth-token': 'noToken' })
        .end((err, response) => {
          response.should.have.status(401);
          assert.equal(response.body.msg, 'Token is not valid');
          done();
        });
    });
    it('it should get 200 response - add account', (done) => {
      chai
        .request(app)
        .post('/api/account')
        .set({ 'x-auth-token': token })
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          assert.hasAllKeys(response.body, [
            'customer',
            'accountNumber',
            'balance',
            '_id',
            '__v',
          ]);
          account = response.body;
          done();
        });
    });
  });
  describe('GET /api/account/me', () => {
    it('it should get 401 response with incorrect token- view account', (done) => {
      chai
        .request(app)
        .get('/api/account/me')
        .set({ 'x-auth-token': 'noToken' })
        .end((err, response) => {
          response.should.have.status(401);
          assert.equal(response.body.msg, 'Token is not valid');
          done();
        });
    });
    it('it should get 200 response - view account', (done) => {
      chai
        .request(app)
        .get('/api/account/me')
        .set({ 'x-auth-token': token })
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('array');

          assert.equal(
            JSON.stringify(response.body[0]),
            JSON.stringify(account)
          );

          done();
        });
    });
  });
  describe('PUT /api/account/deposit/:accountNumber', () => {
    let accountParams = {
      amount: 100,
      currency: 'USD',
    };
    let { amount, currency } = accountParams;

    it('it should get 401 response with incorrect token - deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/' + account.accountNumber)
        .set({ 'x-auth-token': 'noToken' })
        .end((err, response) => {
          response.should.have.status(401);
          assert.equal(response.body.msg, 'Token is not valid');
          done();
        });
    });
    it('it should get 400 response with no params - deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['amount', 'currency']);
          done();
        });
    });
    it('it should get 400 response with no amount - deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ currency })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['amount']);
          done();
        });
    });
    it('it should get 400 response with no currency - deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['currency']);
          done();
        });
    });
    it('it should get 400 response with invalid currency - deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency: 'ABC' })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['currency']);
          done();
        });
    });
    it('it should get 400 response with invalid account number - deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/10145')
        .set({ 'x-auth-token': token })
        .send(accountParams)
        .end((err, response) => {
          response.should.have.status(400);
          assert.equal(response.body.msg, 'Account not found');
          done();
        });
    });
    it('it should get 200 response with currency USD- deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send(accountParams)
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.balance, 200);
          done();
        });
    });
    it('it should get 200 response with currency CAD - deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency: 'CAD' })
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.balance, 300);
          done();
        });
    });
    it('it should get 200 response with currency MXN - deposit', (done) => {
      chai
        .request(app)
        .put('/api/account/deposit/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency: 'MXN' })
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.balance, 310);
          done();
        });
    });
  });
  describe('PUT /api/account/withdraw/:accountNumber', () => {
    let accountParams = {
      amount: 100,
      currency: 'USD',
    };
    let { amount, currency } = accountParams;

    it('it should get 401 response with incorrect token - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': 'noToken' })
        .end((err, response) => {
          response.should.have.status(401);
          assert.equal(response.body.msg, 'Token is not valid');
          done();
        });
    });
    it('it should get 400 response with no params - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['amount', 'currency']);
          done();
        });
    });
    it('it should get 400 response with no amount - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ currency })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['amount']);
          done();
        });
    });
    it('it should get 400 response with no currency - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['currency']);
          done();
        });
    });
    it('it should get 400 response with invalid currency - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency: 'ABC' })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['currency']);
          done();
        });
    });
    it('it should get 400 response with invalid account number - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/10145')
        .set({ 'x-auth-token': token })
        .send(accountParams)
        .end((err, response) => {
          response.should.have.status(400);
          assert.equal(response.body.msg, 'Account not found');
          done();
        });
    });
    it('it should get 400 response - insuffiencient balance - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount: 311, currency })
        .end((err, response) => {
          response.should.have.status(400);
          assert.equal(response.body.msg, 'Insufficient balance to withdraw');
          done();
        });
    });
    it('it should get 200 response with currency MXN - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency: 'MXN' })
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.balance, 300);
          done();
        });
    });
    it('it should get 200 response with currency CAD - withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency: 'CAD' })
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.balance, 200);
          done();
        });
    });
    it('it should get 200 response with currency USD- withdraw', (done) => {
      chai
        .request(app)
        .put('/api/account/withdraw/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount: 50, currency: 'USD' })
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.balance, 100);
          done();
        });
    });
  });
  describe('PUT /api/account/transfer/:accountNumber', () => {
    let accountParams = {
      amount: 100,
      currency: 'USD',
      toAccountNumber: '0796',
    };
    let { amount, currency, toAccountNumber } = accountParams;

    it('it should get 401 response with incorrect token - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': 'noToken' })
        .end((err, response) => {
          response.should.have.status(401);
          assert.equal(response.body.msg, 'Token is not valid');
          done();
        });
    });
    it('it should get 400 response with no params - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, [
            'amount',
            'currency',
            'toAccountNumber',
          ]);
          done();
        });
    });
    it('it should get 400 response with no amount - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ currency, toAccountNumber })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['amount']);
          done();
        });
    });
    it('it should get 400 response with no currency - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, toAccountNumber })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['currency']);
          done();
        });
    });
    it('it should get 400 response with no toAccountNumber - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['toAccountNumber']);
          done();
        });
    });
    it('it should get 400 response with invalid currency - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency: 'ABC', toAccountNumber })
        .end((err, response) => {
          response.should.have.status(400);
          assert.hasAllKeys(response.body.error, ['currency']);
          done();
        });
    });
    it('it should get 400 response with invalid toAccountNumber - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount, currency, toAccountNumber: '12345' })
        .end((err, response) => {
          response.should.have.status(400);
          assert.equal(response.body.msg, 'Account does not exist to deposit');
          done();
        });
    });
    it('it should get 400 response with invalid account number - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/10145')
        .set({ 'x-auth-token': token })
        .send(accountParams)
        .end((err, response) => {
          response.should.have.status(400);
          assert.equal(response.body.msg, 'Account does not exist to withdraw');
          done();
        });
    });
    it('it should get 400 response - insuffiencient balance - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount: 120, currency, toAccountNumber })
        .end((err, response) => {
          response.should.have.status(400);
          assert.equal(response.body.msg, 'Insufficient balance to transfer');
          done();
        });
    });
    it('it should get 200 response with currency MXN - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount: 10, currency: 'MXN', toAccountNumber })
        .end((err, response) => {
          response.should.have.status(200);

          assert.equal(response.body.debit.balance, 99);
          newBalance = toAccount.balance + 1;
          assert.equal(response.body.credit.balance, newBalance);
          done();
        });
    });
    it('it should get 200 response with currency CAD - transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount: 19, currency: 'CAD', toAccountNumber })
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.debit.balance, 80);
          newBalance = newBalance + 19;
          assert.equal(response.body.credit.balance, newBalance);
          done();
        });
    });
    it('it should get 200 response with currency USD- transfer', (done) => {
      chai
        .request(app)
        .put('/api/account/transfer/' + account.accountNumber)
        .set({ 'x-auth-token': token })
        .send({ amount: 25, currency: 'USD', toAccountNumber })
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.debit.balance, 30);
          newBalance = newBalance + 50;
          assert.equal(response.body.credit.balance, newBalance);
          done();
        });
    });
  });
  describe('Delete /api/customers', () => {
    it('it should get 401 response with incorrect token', (done) => {
      chai
        .request(app)
        .delete('/api/customers')
        .set({ 'x-auth-token': 'noToken' })
        .end((err, response) => {
          response.should.have.status(401);
          assert.equal(response.body.msg, 'Token is not valid');
          done();
        });
    });
    it('it should get 200 response - delete customer', (done) => {
      chai
        .request(app)
        .delete('/api/customers')
        .set({ 'x-auth-token': token })
        .end((err, response) => {
          response.should.have.status(200);
          assert.equal(response.body.msg, 'Customer Deleted');
          done();
        });
    });
  });
});
