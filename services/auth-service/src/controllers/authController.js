const { getAdmin } = require('../config/firebase');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} = require('../utils/tokenUtils');
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/cookieUtils');

function buildAccessPayload(user) {
  return {
    uid: user._id.toString(),
    firebaseUid: user.firebaseUid,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    hospitalId: user.hospitalId,
  };
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'firstName, lastName, email, and password are required', code: 'VALIDATION_ERROR' });
    }

    const admin = getAdmin();
    const firebaseUser = await admin.auth().createUser({ email, password, displayName: `${firstName} ${lastName}` });

    await User.create({
      firebaseUid: firebaseUser.uid,
      email,
      firstName,
      lastName,
      role: role || 'USER',
    });

    res.status(201).json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    if (err.code === 'auth/email-already-exists' || err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use', code: 'EMAIL_TAKEN' });
    }
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required', code: 'VALIDATION_ERROR' });
    }

    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    let user = await User.findOne({ firebaseUid: decoded.uid });

    // Auto-provision social sign-in users (e.g. Google) with no existing record
    if (!user) {
      const displayName = decoded.name || decoded.email?.split('@')[0] || 'User';
      const parts = displayName.split(' ');
      const firstName = parts[0] || 'User';
      const lastName = parts.slice(1).join(' ') || '';

      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        firstName,
        lastName,
        role: 'USER',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated', code: 'ACCOUNT_INACTIVE' });
    }

    const accessPayload = buildAccessPayload(user);
    const accessToken = signAccessToken(accessPayload);
    const refreshToken = signRefreshToken({ uid: user._id.toString() });

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: getRefreshTokenExpiry(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    req.session.userId = user._id.toString();
    req.session.role = user.role;

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required', code: 'MISSING_REFRESH_TOKEN' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
    }

    const stored = await RefreshToken.findOne({ token });
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Refresh token is invalid or revoked', code: 'TOKEN_REVOKED' });
    }

    await RefreshToken.findByIdAndUpdate(stored._id, { isRevoked: true });

    const user = await User.findById(stored.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, message: 'User not found or inactive', code: 'USER_INACTIVE' });
    }

    const newAccessToken = signAccessToken(buildAccessPayload(user));
    const newRefreshToken = signRefreshToken({ uid: user._id.toString() });

    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: getRefreshTokenExpiry(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    setRefreshTokenCookie(res, newRefreshToken);
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token) {
      await RefreshToken.updateOne({ token }, { isRevoked: true });
    }

    if (req.user?.firebaseUid) {
      const admin = getAdmin();
      await admin.auth().revokeRefreshTokens(req.user.firebaseUid).catch(() => {});
    }

    req.session.destroy(() => {});
    clearRefreshTokenCookie(res);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout-all
exports.logoutAll = async (req, res, next) => {
  try {
    await RefreshToken.updateMany({ userId: req.user.uid }, { isRevoked: true });

    const admin = getAdmin();
    await admin.auth().revokeRefreshTokens(req.user.firebaseUid).catch(() => {});

    req.session.destroy(() => {});
    clearRefreshTokenCookie(res);

    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.uid).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, department, email } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (department !== undefined) updates.department = department;

    if (email && email !== req.user.email) {
      const admin = getAdmin();
      await admin.auth().updateUser(req.user.firebaseUid, { email });
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user.uid, updates, { new: true }).select('-__v');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'newPassword must be at least 6 characters', code: 'VALIDATION_ERROR' });
    }

    const admin = getAdmin();
    await admin.auth().updateUser(req.user.firebaseUid, { password: newPassword });

    await RefreshToken.updateMany({ userId: req.user.uid }, { isRevoked: true });

    clearRefreshTokenCookie(res);
    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
};
