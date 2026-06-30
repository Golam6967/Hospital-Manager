const jwt = require('jsonwebtoken');
const { getAdmin } = require('../config/firebase');
const User = require('../models/User');

const ACCESS_SECRET  = () => process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET;

function generateAccessToken(userId, role) {
  return jwt.sign({ userId, role }, ACCESS_SECRET(), { expiresIn: '15m' });
}

function generateRefreshToken(userId, role) {
  return jwt.sign({ userId, role }, REFRESH_SECRET(), { expiresIn: '7d' });
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'firstName, lastName, email, and password are required' });
    }

    const admin = getAdmin();
    const fbUser = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    await User.create({ firebaseUid: fbUser.uid, email, firstName, lastName, role: role || 'user' });

    res.status(201).json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    if (err.code === 'auth/email-already-exists' || err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use', code: 'EMAIL_TAKEN' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login  — body: { idToken }
exports.login = async (req, res) => {
  try {
    console.log("Ekhnae ashche kina ke jane ");
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);

    let user = await User.findOne({ firebaseUid: decoded.uid });

    // Auto-provision Google / social sign-in users
    if (!user) {
      const displayName = decoded.name || decoded.email?.split('@')[0] || 'User';
      const parts = displayName.split(' ');
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        firstName: parts[0] || 'User',
        lastName: parts.slice(1).join(' ') || '',
        role: 'user',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const accessToken  = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      data: {
        accessToken,
        user: user.toJSON(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/refresh-token
exports.refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET());
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', code: 'TOKEN_EXPIRED' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    const tokenExists = user.refreshTokens.some(rt => rt.token === token);
    if (!tokenExists) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked. Please log in again.' });
    }

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
    const newAccessToken  = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.role);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    setRefreshCookie(res, newRefreshToken);
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const user = await User.findById(req.userId);

    if (user && token) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
      await user.save();
    }

    if (user) {
      const admin = getAdmin();
      await admin.auth().revokeRefreshTokens(user.firebaseUid).catch(() => {});
    }

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout-all
exports.logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
      const admin = getAdmin();
      await admin.auth().revokeRefreshTokens(user.firebaseUid).catch(() => {});
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(phone && { phone }), ...(department && { department }) },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'newPassword must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const admin = getAdmin();
    await admin.auth().updateUser(user.firebaseUid, { password: newPassword });

    // Revoke all sessions for security
    user.refreshTokens = [];
    await user.save();
    res.clearCookie('refreshToken');

    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
