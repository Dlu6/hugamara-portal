import { sequelize } from "./config/database.js";
import Outlet from "./models/Outlet.js";
import User from "./models/User.js";
import Reservation from "./models/Reservation.js";
import Guest from "./models/Guest.js";
import Event from "./models/Event.js";
import Ticket from "./models/Ticket.js";
import Inventory from "./models/Inventory.js";
import MenuItem from "./models/MenuItem.js";
import Order from "./models/Order.js";
import OrderItem from "./models/OrderItem.js";
import Payment from "./models/Payment.js";
import Staff from "./models/Staff.js";
import Shift from "./models/Shift.js";
import Table from "./models/Table.js";

const seedData = async () => {
  try {
    console.log("🌱 Starting to seed database...");

    // Create outlets
    const outlets = await Outlet.bulkCreate([
      {
        name: "Hugamara Downtown",
        code: "DT",
        type: "restaurant",
        address: "123 Main Street, Downtown",
        city: "Kampala",
        country: "Uganda",
        capacity: 150,
        isActive: true,
        phone: "+1-555-0101",
        email: "downtown@hugamara.com",
        operatingHours: {
          monday: { isOpen: true, open: "09:00", close: "22:00" },
          tuesday: { isOpen: true, open: "09:00", close: "22:00" },
          wednesday: { isOpen: true, open: "09:00", close: "22:00" },
          thursday: { isOpen: true, open: "09:00", close: "22:00" },
          friday: { isOpen: true, open: "09:00", close: "23:00" },
          saturday: { isOpen: true, open: "09:00", close: "23:00" },
          sunday: { isOpen: true, open: "10:00", close: "21:00" },
        },
      },
      {
        name: "Hugamara Beach Resort",
        code: "BR",
        type: "restaurant",
        address: "456 Ocean Drive, Beachfront",
        city: "Entebbe",
        country: "Uganda",
        capacity: 300,
        isActive: true,
        phone: "+1-555-0102",
        email: "beach@hugamara.com",
        operatingHours: {
          monday: { isOpen: true, open: "06:00", close: "23:00" },
          tuesday: { isOpen: true, open: "06:00", close: "23:00" },
          wednesday: { isOpen: true, open: "06:00", close: "23:00" },
          thursday: { isOpen: true, open: "06:00", close: "23:00" },
          friday: { isOpen: true, open: "06:00", close: "23:00" },
          saturday: { isOpen: true, open: "06:00", close: "23:00" },
          sunday: { isOpen: true, open: "06:00", close: "23:00" },
        },
      },
      {
        name: "Hugamara Mountain Lodge",
        code: "ML",
        type: "restaurant",
        address: "789 Mountain View Road",
        city: "Fort Portal",
        country: "Uganda",
        capacity: 80,
        isActive: true,
        phone: "+1-555-0103",
        email: "mountain@hugamara.com",
        operatingHours: {
          monday: { isOpen: true, open: "07:00", close: "21:00" },
          tuesday: { isOpen: true, open: "07:00", close: "21:00" },
          wednesday: { isOpen: true, open: "07:00", close: "21:00" },
          thursday: { isOpen: true, open: "07:00", close: "21:00" },
          friday: { isOpen: true, open: "07:00", close: "21:00" },
          saturday: { isOpen: true, open: "07:00", close: "21:00" },
          sunday: { isOpen: true, open: "07:00", close: "21:00" },
        },
      },
      {
        name: "Hugamara City Center",
        code: "CC",
        type: "restaurant",
        address: "321 Business District",
        city: "Kampala",
        country: "Uganda",
        capacity: 120,
        isActive: true,
        phone: "+1-555-0104",
        email: "city@hugamara.com",
        operatingHours: {
          monday: { isOpen: true, open: "10:00", close: "23:00" },
          tuesday: { isOpen: true, open: "10:00", close: "23:00" },
          wednesday: { isOpen: true, open: "10:00", close: "23:00" },
          thursday: { isOpen: true, open: "10:00", close: "23:00" },
          friday: { isOpen: true, open: "10:00", close: "23:00" },
          saturday: { isOpen: true, open: "10:00", close: "23:00" },
          sunday: { isOpen: true, open: "10:00", close: "23:00" },
        },
      },
      {
        name: "Hugamara Airport Lounge",
        code: "AL",
        type: "restaurant",
        address: "Terminal 3, International Airport",
        city: "Entebbe",
        country: "Uganda",
        capacity: 60,
        isActive: true,
        phone: "+1-555-0105",
        email: "airport@hugamara.com",
        operatingHours: {
          monday: { isOpen: true, open: "00:00", close: "23:59" },
          tuesday: { isOpen: true, open: "00:00", close: "23:59" },
          wednesday: { isOpen: true, open: "00:00", close: "23:59" },
          thursday: { isOpen: true, open: "00:00", close: "23:59" },
          friday: { isOpen: true, open: "00:00", close: "23:59" },
          saturday: { isOpen: true, open: "00:00", close: "23:59" },
          sunday: { isOpen: true, open: "00:00", close: "23:59" },
        },
      },
      {
        name: "Hugamara Golf Club",
        code: "GC",
        type: "restaurant",
        address: "555 Fairway Drive, Golf Course",
        city: "Kampala",
        country: "Uganda",
        capacity: 100,
        isActive: true,
        phone: "+1-555-0106",
        email: "golf@hugamara.com",
        operatingHours: {
          monday: { isOpen: true, open: "06:00", close: "20:00" },
          tuesday: { isOpen: true, open: "06:00", close: "20:00" },
          wednesday: { isOpen: true, open: "06:00", close: "20:00" },
          thursday: { isOpen: true, open: "06:00", close: "20:00" },
          friday: { isOpen: true, open: "06:00", close: "20:00" },
          saturday: { isOpen: true, open: "06:00", close: "20:00" },
          sunday: { isOpen: true, open: "06:00", close: "20:00" },
        },
      },
    ]);

    console.log("✅ Outlets created:", outlets.length);

    // Create admin user
    const adminUser = await User.create({
      email: "admin@hugamara.com",
      password: "password123", // Will be hashed by the model hook
      firstName: "System",
      lastName: "Administrator",
      role: "org_admin",
      isActive: true,
      outletId: outlets[0].id,
    });

    // Create manager users for each outlet
    const managers = await User.bulkCreate([
      {
        email: "manager1@hugamara.com",
        password: "password123", // Will be hashed by the model hook
        firstName: "John",
        lastName: "Manager",
        role: "general_manager",
        isActive: true,
        outletId: outlets[0].id,
      },
      {
        email: "manager2@hugamara.com",
        password: "password123", // Will be hashed by the model hook
        firstName: "Sarah",
        lastName: "Manager",
        role: "general_manager",
        isActive: true,
        outletId: outlets[1].id,
      },
    ]);

    // Note: Outlets are created without manager IDs as per the current model

    console.log("✅ Users created:", managers.length + 1);

    // Create guests
    const guests = await Guest.bulkCreate([
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@email.com",
        phone: "+1-555-0201",
        dateOfBirth: "1985-03-15",
        loyaltyPoints: 150,
        preferences: {
          dietary: "vegetarian",
          seating: "window",
        },
        isActive: true,
      },
      {
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.smith@email.com",
        phone: "+1-555-0202",
        dateOfBirth: "1990-07-22",
        loyaltyPoints: 75,
        preferences: { dietary: "none", seating: "quiet" },
        isActive: true,
      },
      {
        firstName: "Carol",
        lastName: "Davis",
        email: "carol.davis@email.com",
        phone: "+1-555-0203",
        dateOfBirth: "1988-11-08",
        loyaltyPoints: 200,
        preferences: {
          dietary: "gluten-free",
          seating: "outdoor",
        },
        isActive: true,
      },
    ]);

    console.log("✅ Guests created:", guests.length);

    // Create tables for each outlet
    const tables = [];
    for (const outlet of outlets) {
      const outletTables = await Table.bulkCreate([
        {
          outletId: outlet.id,
          tableNumber: "1",
          capacity: 2,
          status: "available",
          location: "window",
          tableType: "standard",
        },
        {
          outletId: outlet.id,
          tableNumber: "2",
          capacity: 4,
          status: "available",
          location: "center",
          tableType: "standard",
        },
        {
          outletId: outlet.id,
          tableNumber: "3",
          capacity: 6,
          status: "available",
          location: "outdoor",
          tableType: "outdoor",
        },
        {
          outletId: outlet.id,
          tableNumber: "4",
          capacity: 8,
          status: "available",
          location: "private",
          tableType: "private",
        },
        {
          outletId: outlet.id,
          tableNumber: "5",
          capacity: 2,
          status: "available",
          location: "bar",
          tableType: "bar",
        },
      ]);
      tables.push(...outletTables);
    }

    console.log("✅ Tables created:", tables.length);

    // Create reservations
    const reservations = await Reservation.bulkCreate([
      {
        outletId: outlets[0].id,
        reservationNumber: "RES001",
        reservationDate: "2024-01-15",
        reservationTime: "19:00:00",
        partySize: 2,
        status: "confirmed",
        specialRequests: "Anniversary celebration",
        source: "web",
      },
      {
        outletId: outlets[1].id,
        reservationNumber: "RES002",
        reservationDate: "2024-01-16",
        reservationTime: "18:30:00",
        partySize: 4,
        status: "pending",
        specialRequests: "Birthday party",
        source: "phone",
      },
      {
        outletId: outlets[0].id,
        reservationNumber: "RES003",
        reservationDate: "2024-01-17",
        reservationTime: "20:00:00",
        partySize: 3,
        status: "confirmed",
        specialRequests: "Business dinner",
        source: "walk_in",
      },
    ]);

    console.log("✅ Reservations created:", reservations.length);

    // Create events
    const events = await Event.bulkCreate([
      {
        outletId: outlets[0].id,
        title: "Wine Tasting Evening",
        description: "Exclusive wine tasting with sommelier",
        eventType: "wine_tasting",
        startDate: "2024-01-20",
        endDate: "2024-01-20",
        startTime: "18:00:00",
        endTime: "21:00:00",
        capacity: 30,
        expectedAttendance: 30,
        actualAttendance: 15,
        isTicketed: true,
        ticketPrice: 75.0,
        ticketQuantity: 30,
        ticketsSold: 15,
        status: "active",
        revenue: 1125.0,
      },
      {
        outletId: outlets[1].id,
        title: "Beach BBQ Party",
        description: "Sunset beach barbecue with live music",
        eventType: "other",
        startDate: "2024-01-25",
        endDate: "2024-01-25",
        startTime: "17:00:00",
        endTime: "23:00:00",
        capacity: 100,
        expectedAttendance: 100,
        actualAttendance: 45,
        isTicketed: true,
        ticketPrice: 45.0,
        ticketQuantity: 100,
        ticketsSold: 45,
        status: "active",
        revenue: 2025.0,
      },
    ]);

    console.log("✅ Events created:", events.length);

    // Create tickets for events
    const tickets = await Ticket.bulkCreate([
      {
        ticketNumber: "WT001",
        outletId: outlets[0].id,
        title: "Wine Tasting Event Ticket",
        description: "Ticket for Wine Tasting Evening event",
        category: "other",
        priority: "medium",
        status: "resolved",
        tags: ["event", "wine-tasting"],
        resolvedAt: "2024-01-20T21:00:00Z",
      },
      {
        ticketNumber: "BB001",
        outletId: outlets[1].id,
        title: "Beach BBQ Event Ticket",
        description: "Ticket for Beach BBQ Party event",
        category: "other",
        priority: "medium",
        status: "resolved",
        tags: ["event", "beach-bbq"],
        resolvedAt: "2024-01-25T23:00:00Z",
      },
    ]);

    console.log("✅ Tickets created:", tickets.length);

    // Create menu items
    const menuItems = await MenuItem.bulkCreate([
      {
        outletId: outlets[0].id,
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with herbs",
        category: "main_course",
        price: 28.0,
        cost: 12.0,
        isAvailable: true,
        dietaryTags: ["none"],
      },
      {
        outletId: outlets[0].id,
        name: "Vegetarian Pasta",
        description: "Homemade pasta with seasonal vegetables",
        category: "main_course",
        price: 22.0,
        cost: 8.0,
        isAvailable: true,
        dietaryTags: ["vegetarian"],
      },
      {
        outletId: outlets[1].id,
        name: "Lobster Roll",
        description: "Fresh Maine lobster on brioche",
        category: "main_course",
        price: 35.0,
        cost: 18.0,
        isAvailable: true,
        dietaryTags: ["none"],
      },
    ]);

    console.log("✅ Menu items created:", menuItems.length);

    // Create inventory items
    const inventory = await Inventory.bulkCreate([
      {
        outletId: outlets[0].id,
        itemName: "Salmon Fillets",
        category: "food",
        subcategory: "seafood",
        currentStock: 50,
        unit: "pieces",
        reorderPoint: 10,
        unitCost: 15.0,
        supplierName: "Fresh Fish Co.",
        isActive: true,
      },
      {
        outletId: outlets[0].id,
        itemName: "Fresh Vegetables",
        category: "food",
        subcategory: "produce",
        currentStock: 100,
        unit: "kg",
        reorderPoint: 20,
        unitCost: 5.0,
        supplierName: "Local Farm Market",
        isActive: true,
      },
    ]);

    console.log("✅ Inventory items created:", inventory.length);

    // Create staff members
    const staff = await Staff.bulkCreate([
      {
        outletId: outlets[0].id,
        employeeId: "EMP001",
        position: "Manager",
        department: "management",
        hireDate: "2023-01-15",
        salary: 45000.0,
        isActive: true,
        payFrequency: "monthly",
      },
      {
        outletId: outlets[0].id,
        employeeId: "EMP002",
        position: "Server",
        department: "front_of_house",
        hireDate: "2023-03-01",
        hourlyRate: 15.0,
        isActive: true,
        payFrequency: "hourly",
      },
    ]);

    console.log("✅ Staff created:", staff.length);

    // Create shifts
    const shifts = await Shift.bulkCreate([
      {
        outletId: outlets[0].id,
        shiftDate: "2024-01-15",
        startTime: "08:00:00",
        endTime: "16:00:00",
        status: "scheduled",
        position: "Manager",
        shiftType: "regular",
      },
      {
        outletId: outlets[0].id,
        shiftDate: "2024-01-15",
        startTime: "16:00:00",
        endTime: "23:00:00",
        status: "scheduled",
        position: "Server",
        shiftType: "regular",
      },
    ]);

    console.log("✅ Shifts created:", shifts.length);

    // Create orders
    const orders = await Order.bulkCreate([
      {
        outletId: outlets[0].id,
        orderNumber: "ORD001",
        orderType: "dine_in",
        status: "completed",
        subtotal: 50.0,
        taxAmount: 5.0,
        discountAmount: 0.0,
        totalAmount: 55.0,
        paymentStatus: "paid",
        paymentMethod: "card",
      },
    ]);

    console.log("✅ Orders created:", orders.length);

    // Create order items
    const orderItems = await OrderItem.bulkCreate([
      {
        orderId: orders[0].id,
        menuItemId: menuItems[0].id,
        quantity: 1,
        unitPrice: 28.0,
        totalPrice: 28.0,
        specialInstructions: "Medium rare",
        status: "served",
      },
      {
        orderId: orders[0].id,
        menuItemId: menuItems[1].id,
        quantity: 1,
        unitPrice: 22.0,
        totalPrice: 22.0,
        specialInstructions: "No garlic",
        status: "served",
      },
    ]);

    console.log("✅ Order items created:", orderItems.length);

    // Create payments
    const payments = await Payment.bulkCreate([
      {
        orderId: orders[0].id,
        outletId: outlets[0].id,
        paymentNumber: "PAY001",
        amount: 55.0,
        currency: "UGX",
        paymentMethod: "credit_card",
        paymentStatus: "completed",
        transactionId: "TXN001",
        processedAt: "2024-01-15T19:30:00Z",
      },
    ]);

    console.log("✅ Payments created:", payments.length);

    console.log("🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - Outlets: ${outlets.length}`);
    console.log(`   - Users: ${managers.length + 1}`);
    console.log(`   - Guests: ${guests.length}`);
    console.log(`   - Tables: ${tables.length}`);
    console.log(`   - Reservations: ${reservations.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Tickets: ${tickets.length}`);
    console.log(`   - Menu Items: ${menuItems.length}`);
    console.log(`   - Inventory: ${inventory.length}`);
    console.log(`   - Staff: ${staff.length}`);
    console.log(`   - Shifts: ${shifts.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);
    console.log(`   - Payments: ${payments.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export default seedData;
