import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'No access token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.id, { where: { isActive: true } });
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found or inactive'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Access token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during authentication'
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated'
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'User does not have required role'
      });
    }

    next();
  };
};

export const requireOutletAccess = (outletIdParam = 'outletId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated'
      });
    }

    const requestedOutletId = req.params[outletIdParam] || req.body[outletIdParam];

    // Org admins have access to all outlets
    if (req.user.role === 'org_admin') {
      return next();
    }

    // Check if user has access to the requested outlet
    if (req.user.outletId !== requestedOutletId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'User does not have access to this outlet'
      });
    }

    next();
  };
};

export const requireOwnership = (modelParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated'
        });
      }

      const resourceId = req.params[modelParam];
      
      // Org admins can access all resources
      if (req.user.role === 'org_admin') {
        return next();
      }

      // For other roles, check if they own the resource or have outlet access
      // This would need to be implemented based on the specific model
      // For now, we'll just pass through and let the controller handle it
      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An error occurred while checking ownership'
      });
    }
  };
};