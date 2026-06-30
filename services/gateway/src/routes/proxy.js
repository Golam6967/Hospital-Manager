const { createProxyMiddleware } = require('http-proxy-middleware');
const { authLimiter, hospitalWriteLimiter } = require('../middleware/rateLimiter');

const WRITE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

function buildProxy(target, pathRewrite) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward gateway auth headers set by gatewayAuth middleware
        if (req.gatewayHeaders) {
          Object.entries(req.gatewayHeaders).forEach(([key, value]) => {
            if (value !== undefined) proxyReq.setHeader(key, value);
          });
        }
      },
      error: (err, req, res) => {
        res.status(502).json({ success: false, message: 'Upstream service unavailable', code: 'UPSTREAM_ERROR' });
      },
    },
  });
}

function mountProxyRoutes(app) {
  const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  const HOSPITAL_URL = process.env.HOSPITAL_SERVICE_URL || 'http://localhost:3002';

  // Auth routes
  app.use('/api/auth', authLimiter, buildProxy(AUTH_URL));
  app.use('/api/users', buildProxy(AUTH_URL));

  // Hospital write routes (extra rate limit)
  app.use('/api/hospitals', (req, res, next) => {
    if (WRITE_METHODS.includes(req.method)) {
      hospitalWriteLimiter(req, res, next);
    } else {
      next();
    }
  }, buildProxy(HOSPITAL_URL));
}

module.exports = { mountProxyRoutes };
