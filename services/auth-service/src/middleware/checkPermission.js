function checkPermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
    const permissions = req.user.permissions || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ success: false, message: `Forbidden: missing permission '${permission}'`, code: 'FORBIDDEN' });
    }
    next();
  };
}

module.exports = checkPermission;
