const { verifyRefreshToken } = require('../utils/tokenUtils');

function verifyRefreshJWT(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required', code: 'MISSING_REFRESH_TOKEN' });
    }
    const payload = verifyRefreshToken(token);
    req.refreshTokenPayload = payload;
    req.rawRefreshToken = token;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', code: 'INVALID_REFRESH_TOKEN' });
  }
}

module.exports = verifyRefreshJWT;
