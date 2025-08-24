import bcrypt from 'bcryptjs';

export const up = async (queryInterface, Sequelize) => {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hugamara.com',
      password: hashedPassword,
      phone: '+256-XXX-XXX-XXX',
      role: 'org_admin',
      outletId: '550e8400-e29b-41d4-a716-446655440001', // Server Room
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      firstName: 'Villa',
      lastName: 'Manager',
      email: 'villa.manager@hugamara.com',
      password: hashedPassword,
      phone: '+256-XXX-XXX-XXX',
      role: 'general_manager',
      outletId: '550e8400-e29b-41d4-a716-446655440002', // The Villa Ug
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440003',
      firstName: 'Luna',
      lastName: 'Manager',
      email: 'luna.manager@hugamara.com',
      password: hashedPassword,
      phone: '+256-XXX-XXX-XXX',
      role: 'general_manager',
      outletId: '550e8400-e29b-41d4-a716-446655440003', // Luna
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440004',
      firstName: 'Cueva',
      lastName: 'Manager',
      email: 'cueva.manager@hugamara.com',
      password: hashedPassword,
      phone: '+256-XXX-XXX-XXX',
      role: 'general_manager',
      outletId: '550e8400-e29b-41d4-a716-446655440004', // La Cueva
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440005',
      firstName: 'Patio',
      lastName: 'Manager',
      email: 'patio.manager@hugamara.com',
      password: hashedPassword,
      phone: '+256-XXX-XXX-XXX',
      role: 'general_manager',
      outletId: '550e8400-e29b-41d4-a716-446655440005', // Patio Bella
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440006',
      firstName: 'Maze',
      lastName: 'Manager',
      email: 'maze.manager@hugamara.com',
      password: hashedPassword,
      phone: '+256-XXX-XXX-XXX',
      role: 'general_manager',
      outletId: '550e8400-e29b-41d4-a716-446655440006', // Maze
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440007',
      firstName: 'Maze Bistro',
      lastName: 'Manager',
      email: 'mazebistro.manager@hugamara.com',
      password: hashedPassword,
      phone: '+256-XXX-XXX-XXX',
      role: 'general_manager',
      outletId: '550e8400-e29b-41d4-a716-446655440007', // The Maze Bistro
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440008',
      firstName: 'Sample',
      lastName: 'Staff',
      email: 'staff@hugamara.com',
      password: hashedPassword,
      phone: '+256-XXX-XXX-XXX',
      role: 'staff',
      outletId: '550e8400-e29b-41d4-a716-446655440002', // The Villa Ug
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await queryInterface.bulkInsert('users', users, {});
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete('users', null, {});
};