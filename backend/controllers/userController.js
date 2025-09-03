import { User, Outlet } from '../models/index.js';
import { getUserPermissions } from '../config/permissions.js';

export const getAllUsers = async (req, res) => {
  try {
    const { outletId, role, isActive = true } = req.query;
    
    const whereClause = { isActive };
    
    if (outletId) whereClause.outletId = outletId;
    if (role) whereClause.role = role;

    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['id', 'name', 'code', 'type']
        }
      ],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    res.status(200).json({
      users: users.map(user => user.toJSON())
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching users'
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
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
        message: 'The requested user does not exist'
      });
    }

    const userData = user.toJSON();
    userData.permissions = getUserPermissions(user.role);

    res.status(200).json({
      user: userData
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching user'
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while creating user'
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data if present (use changePassword endpoint)
    delete updateData.password;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already taken',
          message: 'A user with this email already exists'
        });
      }
    }

    await user.update(updateData);

    res.status(200).json({
      message: 'User updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while updating user'
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Soft delete - set isActive to false
    await user.update({ isActive: false });

    res.status(200).json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while deleting user'
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, outletId } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    await user.update({ role, outletId });

    res.status(200).json({
      message: 'User role updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while updating user role'
    });
  }
};
