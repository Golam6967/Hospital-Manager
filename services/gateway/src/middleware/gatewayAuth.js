const jwt = require('jsonwebtoken');

const WRITE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

function gatewayAuth(req, res, next) {
  // Always attach gateway secret for downstream trust
  req.gatewayHeaders = { 'x-gateway-secret': process.env.GATEWAY_SECRET };

  const isHospitalRoute = req.path.startsWith('/api/hospitals');
  const isAuthRoute = req.path.startsWith('/api/auth') || req.path.startsWith('/api/users');

  // Auth routes pass through — auth service handles its own verification
  if (isAuthRoute) {
    return next();
  }

  if (isHospitalRoute) {
    const isWrite = WRITE_METHODS.includes(req.method);

    if (isWrite) {
      // Require valid Access JWT for write operations
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization header required', code: 'UNAUTHORIZED' });
      }

      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.gatewayHeaders['x-user-id'] = payload.uid;
        req.gatewayHeaders['x-user-role'] = payload.role;
        req.gatewayHeaders['x-user-permissions'] = (payload.permissions || []).join(',');
      } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired access token', code: 'INVALID_TOKEN' });
      }
    }
    // GET requests pass through with gateway secret only
    return next();
  }

  next();
}

module.exports = gatewayAuth;
