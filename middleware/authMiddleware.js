const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded; // you can now use req.user.userId etc.
    next();
  } catch (err) {
    return res.redirect('/');
  }
};

module.exports = authMiddleware;