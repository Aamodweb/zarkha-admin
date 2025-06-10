// middleware/redirectIfAuthenticated.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.access_token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      // Already logged in, redirect
      return res.redirect('/dashboard');
    } catch (err) {
      // Invalid token, proceed to login
      return next();
    }
  }

  // No token, allow to continue to login
  return next();
};
