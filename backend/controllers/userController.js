const User = require('../models/User');
const { logActivity } = require('../services/activityLogService');
const bcrypt = require('bcryptjs');

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    if (status) {
      query.isActive = status === 'active';
    }

    const safeLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const safePage = parseInt(page, 10) || 1;
    const skip = (safePage - 1) * safeLimit;
    
    // Safe sorting
    const allowedSortFields = ['createdAt', 'name', 'role', 'isActive'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(safeLimit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'admin' && isActive === false) {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, error: 'Cannot deactivate the only active admin' });
      }
    }

    user.isActive = isActive;
    await user.save();

    await logActivity({
      actor: req.user._id,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: user._id,
      description: `User ${user.name} was ${isActive ? 'activated' : 'deactivated'}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!['resident', 'security', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, error: 'Cannot remove role from the only active admin' });
      }
    }

    user.role = role;
    await user.save();

    await logActivity({
      actor: req.user._id,
      action: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: user._id,
      description: `User ${user.name} role changed to ${role}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      role: role || 'resident',
      password
    });

    await logActivity({
      actor: req.user._id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      description: `Created new user ${user.name} as ${user.role}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
  createUser
};
