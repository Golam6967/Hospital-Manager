const isProd = process.env.NODE_ENV === 'production';

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearRefreshTokenCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
  });
}

module.exports = { setRefreshTokenCookie, clearRefreshTokenCookie };
