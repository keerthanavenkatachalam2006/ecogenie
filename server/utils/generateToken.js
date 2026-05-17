const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Use number (seconds) instead of string to avoid format issues
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: 604800, // 7 days in seconds - avoids string parsing issues
  });
};

module.exports = generateToken;
