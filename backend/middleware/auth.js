import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

export const requireModuleAccess = (req, res, next) => {
  // Admins and owners bypass module restrictions
  if (req.user?.role === 'admin' || req.user?.role === 'owner') {
    return next();
  }
  
  const moduleName = req.params.module || req.body.module || req.query.module;

  if (!moduleName) {
    // If we cannot determine the module from the request, let the controller handle it safely
    return next();
  }

  // Staff must have the module assigned
  if (req.user?.role === 'staff' && req.user.assignedModules && req.user.assignedModules.includes(moduleName)) {
    return next();
  }
  
  return res.status(403).json({ success: false, message: `Access denied to ${moduleName} module` });
};
