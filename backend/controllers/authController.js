import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  permissions: user.permissions,
  assignedModules: user.assignedModules,
  profileImage: user.profileImage,
});

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);
    const userObj = formatUser(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
      data: { ...userObj, token },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: formatUser(req.user),
    data: req.user,
  });
};

export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
