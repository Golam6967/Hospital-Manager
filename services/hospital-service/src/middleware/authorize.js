function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: no user context', code: 'UNAUTHORIZED' });
    }
    const userRole = (req.user.role || '').toUpperCase();
    const allowed = roles.map(r => r.toUpperCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role', code: 'FORBIDDEN' });
    }
    next();
  };
}

module.exports = authorize;
