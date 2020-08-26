const jwt = require('jsonwebtoken');
const config = require('../config/default.json');

module.exports = function (req, res, next) {
  //get the token from the header
  const token = req.header('x-auth-token');

  // Check if not token exists : 401  not authorized
  if (!token)
    return res.status(401).json({ msg: 'No token authoriazation denied' });

  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.customer = decoded.customer;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
