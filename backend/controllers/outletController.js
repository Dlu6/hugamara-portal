import { Outlet, User } from '../models/index.js';

export const getAllOutlets = async (req, res) => {
  try {
    const outlets = await Outlet.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName', 'role'],
          where: { isActive: true },
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      outlets: outlets.map(outlet => outlet.toJSON())
    });

  } catch (error) {
    console.error('Get outlets error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching outlets'
    });
  }
};

export const getOutletById = async (req, res) => {
  try {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName', 'role', 'email'],
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!outlet) {
      return res.status(404).json({
        error: 'Outlet not found',
        message: 'The requested outlet does not exist'
      });
    }

    res.status(200).json({
      outlet: outlet.toJSON()
    });

  } catch (error) {
    console.error('Get outlet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching outlet'
    });
  }
};

export const createOutlet = async (req, res) => {
  try {
    const outletData = req.body;
    outletData.createdBy = req.user.id;

    const outlet = await Outlet.create(outletData);

    res.status(201).json({
      message: 'Outlet created successfully',
      outlet: outlet.toJSON()
    });

  } catch (error) {
    console.error('Create outlet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while creating outlet'
    });
  }
};

export const updateOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.id;

    const outlet = await Outlet.findByPk(id);

    if (!outlet) {
      return res.status(404).json({
        error: 'Outlet not found',
        message: 'The requested outlet does not exist'
      });
    }

    await outlet.update(updateData);

    res.status(200).json({
      message: 'Outlet updated successfully',
      outlet: outlet.toJSON()
    });

  } catch (error) {
    console.error('Update outlet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while updating outlet'
    });
  }
};

export const deleteOutlet = async (req, res) => {
  try {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id);

    if (!outlet) {
      return res.status(404).json({
        error: 'Outlet not found',
        message: 'The requested outlet does not exist'
      });
    }

    // Soft delete - set isActive to false
    await outlet.update({ 
      isActive: false,
      updatedBy: req.user.id
    });

    res.status(200).json({
      message: 'Outlet deleted successfully'
    });

  } catch (error) {
    console.error('Delete outlet error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while deleting outlet'
    });
  }
};

export const getOutletStats = async (req, res) => {
  try {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id);

    if (!outlet) {
      return res.status(404).json({
        error: 'Outlet not found',
        message: 'The requested outlet does not exist'
      });
    }

    // Get basic stats (in a real app, you'd aggregate data)
    const stats = {
      totalUsers: await User.count({ where: { outletId: id, isActive: true } }),
      isOpen: outlet.isOpen(),
      operatingHours: outlet.operatingHours
    };

    res.status(200).json({
      outletId: id,
      stats
    });

  } catch (error) {
    console.error('Get outlet stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching outlet statistics'
    });
  }
};