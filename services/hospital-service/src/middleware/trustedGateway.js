function trustedGateway(req, res, next) {
  const gatewaySecret = req.headers['x-gateway-secret'];
  if (!gatewaySecret || gatewaySecret !== process.env.GATEWAY_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden: invalid gateway secret', code: 'GATEWAY_FORBIDDEN' });
  }

  // Inject user context from forwarded headers (set by gateway)
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const userPermissions = req.headers['x-user-permissions'];

  if (userId) {
    req.user = {
      id: userId,
      role: userRole,
      permissions: userPermissions ? userPermissions.split(',') : [],
    };
  }

  next();
}

module.exports = trustedGateway;
