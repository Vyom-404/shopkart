const jwt = require('jsonwebtoken');

const generateToken = (customerId) => {
  return jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_
  });
};

module.exports = generateToken;
