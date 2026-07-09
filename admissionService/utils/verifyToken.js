const jwt = require('jsonwebtoken');

module.exports = verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return false;
  }
};
