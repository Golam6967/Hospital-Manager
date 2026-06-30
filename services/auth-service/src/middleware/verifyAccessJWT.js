const { verifyAccessToken } = require('../utils/tokenUtils');

function verifyAccessJWT(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required', code: 'MISSING_ACCESS_TOKEN' });
    }
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token', code: 'INVALID_ACCESS_TOKEN' });
  }
}

module.exports = verifyAccessJWT;
