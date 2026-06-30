function sessionCheck(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid', code: 'SESSION_INVALID' });
  }
  next();
}

module.exports = sessionCheck;
