const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'parknexus_default_secret_key_123', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = { generateToken };
