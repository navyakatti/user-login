// GenerateSecretKey.js

const crypto = require('crypto');

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('hex');
console.log('Generated Secret Key:', secretKey);

// Export the secret key for use in other files
module.exports = secretKey;
