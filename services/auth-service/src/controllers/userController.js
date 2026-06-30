const { getAdmin } = require('../config/firebase');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

// GET /api/users
exports.listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-__v').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({ success: true, data: { users, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/stats
exports.getUserStats = async (req, res, next) => {
  try {
    const [total, activeCount, byRole] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        total,
        active: activeCount,
        inactive: total - activeCount,
        byRole: byRole.map(r => ({ role: r._id, count: r.count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone, department, hospitalId, permissions } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'firstName, lastName, email, password are required', code: 'VALIDATION_ERROR' });
    }

    const admin = getAdmin();
    const fbUser = await admin.auth().createUser({ email, password, displayName: `${firstName} ${lastName}` });

    const user = await User.create({
      firebaseUid: fbUser.uid,
      email,
      firstName,
      lastName,
      phone,
      department,
      hospitalId,
      role: role || 'USER',
      permissions: permissions || [],
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 'auth/email-already-exists' || err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use', code: 'EMAIL_TAKEN' });
    }
    next(err);
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, department, hospitalId, role, permissions, email } = req.body;

    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (department !== undefined) updates.department = department;
    if (hospitalId !== undefined) updates.hospitalId = hospitalId;
    if (role) updates.role = role;
    if (permissions) updates.permissions = permissions;

    if (email && email !== existing.email) {
      const admin = getAdmin();
      await admin.auth().updateUser(existing.firebaseUid, { email });
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-__v');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });

    const admin = getAdmin();
    await admin.auth().deleteUser(user.firebaseUid).catch(() => {});
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/toggle-status
exports.toggleStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });

    const updated = await User.findByIdAndUpdate(req.params.id, { isActive: !user.isActive }, { new: true });
    res.json({ success: true, data: { id: updated._id, isActive: updated.isActive } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'newPassword must be at least 6 characters', code: 'VALIDATION_ERROR' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });

    const admin = getAdmin();
    await admin.auth().updateUser(user.firebaseUid, { password: newPassword });
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/assign-role
exports.assignRole = async (req, res, next) => {
  try {
    const validRoles = ['ADMIN', 'STAFF', 'DOCTOR', 'MANAGER', 'USER'];
    const { role } = req.body;
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `role must be one of: ${validRoles.join(', ')}`, code: 'VALIDATION_ERROR' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('_id email role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
