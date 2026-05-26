import User from '../models/User.js';
import Booking from '../models/Booking.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { 
      name, email, mobile, password, role, permissions, assignedModules,
      profileImage, phone, address, ownershipPercentage, bio, joinDate
    } = req.body;
    
    // Only admin can create admins/owners
    if (role === 'admin' || role === 'owner') {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: `Only admins can create ${role} accounts` });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role,
      permissions,
      assignedModules,
      profileImage,
      phone,
      address,
      ownershipPercentage,
      bio,
      joinDate,
    });

    res.status(201).json({ success: true, data: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { 
      name, email, mobile, role, permissions, assignedModules, isActive, password,
      profileImage, phone, address, ownershipPercentage, bio, joinDate
    } = req.body;

    // Only admin can elevate to admin/owner
    if (role && (role === 'admin' || role === 'owner')) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: `Only admins can assign ${role} role` });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.mobile = mobile !== undefined ? mobile : user.mobile;
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    if (assignedModules) user.assignedModules = assignedModules;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;
    
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (ownershipPercentage !== undefined) user.ownershipPercentage = ownershipPercentage;
    if (bio !== undefined) user.bio = bio;
    if (joinDate !== undefined) user.joinDate = joinDate;

    const updatedUser = await user.save();
    res.json({
      success: true,
      data: { _id: updatedUser._id, name: updatedUser.name, role: updatedUser.role, isActive: updatedUser.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const totalBookings = await Booking.countDocuments({ bookingOwnerId: user._id });
    const recentBookings = await Booking.find({ bookingOwnerId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        user,
        activity: {
          totalBookings,
          recentBookings
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
