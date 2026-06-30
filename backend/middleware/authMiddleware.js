const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No access token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId   = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid access token' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ success: false, message: 'User role not found in token' });
    }
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message: `Access denied. Required role(s): ${allowedRoles.join(', ')}` });
    }
    next();
  };
};

module.exports = { verifyAccessToken, authorize };
