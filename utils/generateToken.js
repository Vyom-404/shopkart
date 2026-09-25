const jwt = require('jsonwebtoken');

const generateToken = (customerId) => {
  return jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    // `JWT_EXPIRES_IN` accepts values such as "7d", "12h", or seconds.
    // The fallback keeps authentication usable if the optional setting is omitted.
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = generateToken;
