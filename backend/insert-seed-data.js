import { sequelize } from "./config/database.js";
import { User, Outlet } from "./models/index.js";
import bcrypt from "bcryptjs";

const insertSeedData = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Create a test outlet
    const outlet = await sequelize.models.Outlet.create({
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Server Room (cs.hugamara.com)",
      code: "CS",
      type: "hq",
      domain: "cs.hugamara.com",
      address: "Server Room, Hugamara HQ",
      city: "Kampala",
      country: "Uganda",
      phone: "+256-XXX-XXX-XXX",
      email: "admin@hugamara.com",
      timezone: "Africa/Kampala",
      currency: "UGX",
      isActive: true,
      settings: {},
      operatingHours: {},
      capacity: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Outlet created:", outlet.name);

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create a test user
    const user = await sequelize.models.User.create({
      id: "660e8400-e29b-41d4-a716-446655440001",
      firstName: "Admin",
      lastName: "User",
      email: "admin@hugamara.com",
      password: hashedPassword,
      phone: "+256-XXX-XXX-XXX",
      role: "org_admin",
      outletId: outlet.id,
      isActive: true,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ User created:", user.email);

    console.log("\n🎉 Seed data inserted successfully!");
    console.log("You can now login with:");
    console.log("Email: admin@hugamara.com");
    console.log("Password: password123");
    console.log("Outlet: CS (Server Room)");
  } catch (error) {
    console.error("❌ Error inserting seed data:", error);
  } finally {
    await sequelize.close();
  }
};

insertSeedData();
