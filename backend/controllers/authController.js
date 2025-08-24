import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Outlet } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      outletId: user.outletId
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password, outletId } = req.body;

    // Validate input
    if (!email || !password || !outletId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and outlet ID are required'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email, isActive: true },
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'name', 'code', 'type']
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Validate outlet access
    if (user.role !== 'org_admin' && user.outletId !== outletId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'User does not have access to this outlet'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Prepare user data (exclude password)
    const userData = user.toJSON();

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token: accessToken,
      refreshToken: refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
};

export const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during logout'
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'name', 'code', 'type']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    res.status(200).json({
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching user data'
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'Token is not a refresh token'
      });
    }

    // Get user
    const user = await User.findByPk(decoded.id, { where: { isActive: true } });
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User does not exist or is inactive'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(user);

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newAccessToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Refresh token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Refresh token has expired'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while refreshing token'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Validate current password
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while changing password'
    });
  }
};