# bank-back-end-application

Created a back-end applcation for bank using nodejs, express.js. Testing the application using Mocha & Chai.

<ol>
  <li>The following routes implemented to perform authentication, add a account, deposit, withdraw, transfer the fund, delete the customer
    <ul>
      <li>POST /api/customers Register</li>
<li>GET /api/customers Get registered customer using token</li>
<li>POST /api/auth Login</li>
<li>GET /api/account/:accountNumber Get account by accountNumber</li>
<li>POST /api/account/ Add an account</li>
<li>GET /api/account/me Get current accounts</li>
<li>PUT /api/account/deposit/:accountNumber Deposit the amount to account</li>
<li>PUT /api/account/withdraw/:accountNumber Withdraw the amount from account</li>
<li>PUT /api/account/transfer/:accountNumber Transfer the amount from one account to another account</li>
<li>DELETE api/customers</li>
      
  </ul>
   </li>
  
  <li>Testing the application using Mocha Chai</li>
  
</ol>

## Prerequisites
In order to run this project node.js and npm both need to have been installed.

## Dependencies
 "bcryptjs": "^2.4.3",    
  "chai-http": "^4.3.0",
  "config": "^3.3.1",
  "express": "^4.17.1",
  "express-validator": "^6.6.1",
  "jsonwebtoken": "^8.5.1",    
  "moment": "^2.27.0",
  "mongoose": "^5.10.0"

## Dev Dependencies
"chai": "^4.2.0",
"mocha": "^8.1.1",
"nodemon": "^2.0.4"

## Deployment
<ol>
<li>To run the application - npm run server</li>
<li>To test the application - npm run test</li>
</ol>
