const { Outlet } = require("./models/index.cjs");

const outlets = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Server Room",
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
    settings: {
      theme: "dark",
      notifications: true,
      autoBackup: true,
    },
    operatingHours: {
      monday: { isOpen: true, open: "00:00", close: "23:59" },
      tuesday: { isOpen: true, open: "00:00", close: "23:59" },
      wednesday: { isOpen: true, open: "00:00", close: "23:59" },
      thursday: { isOpen: true, open: "00:00", close: "23:59" },
      friday: { isOpen: true, open: "00:00", close: "23:59" },
      saturday: { isOpen: true, open: "00:00", close: "23:59" },
      sunday: { isOpen: true, open: "00:00", close: "23:59" },
    },
    capacity: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "The Villa Ug",
    code: "VILLA",
    type: "nightclub",
    address: "Bukoto Ntinda Road, Kampala",
    city: "Kampala",
    country: "Uganda",
    phone: "+256-XXX-XXX-XXX",
    email: "villa@hugamara.com",
    timezone: "Africa/Kampala",
    currency: "UGX",
    isActive: true,
    settings: {
      theme: "dark",
      music: "afrobeat",
      dressCode: "smart_casual",
    },
    operatingHours: {
      monday: { isOpen: false, open: "", close: "" },
      tuesday: { isOpen: false, open: "", close: "" },
      wednesday: { isOpen: true, open: "20:00", close: "04:00" },
      thursday: { isOpen: true, open: "20:00", close: "04:00" },
      friday: { isOpen: true, open: "20:00", close: "04:00" },
      saturday: { isOpen: true, open: "20:00", close: "04:00" },
      sunday: { isOpen: false, open: "", close: "" },
    },
    capacity: 200,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Luna",
    code: "LUNA",
    type: "nightclub",
    address: "Cube Kisementi, Kampala",
    city: "Kampala",
    country: "Uganda",
    phone: "+256-XXX-XXX-XXX",
    email: "luna@hugamara.com",
    timezone: "Africa/Kampala",
    currency: "UGX",
    isActive: true,
    settings: {
      theme: "dark",
      music: "electronic",
      dressCode: "elegant",
    },
    operatingHours: {
      monday: { isOpen: false, open: "", close: "" },
      tuesday: { isOpen: false, open: "", close: "" },
      wednesday: { isOpen: true, open: "21:00", close: "05:00" },
      thursday: { isOpen: true, open: "21:00", close: "05:00" },
      friday: { isOpen: true, open: "21:00", close: "05:00" },
      saturday: { isOpen: true, open: "21:00", close: "05:00" },
      sunday: { isOpen: false, open: "", close: "" },
    },
    capacity: 150,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "La Cueva",
    code: "CUEVA",
    type: "nightclub",
    address: "Bukoto, Ntinda Road, Kampala",
    city: "Kampala",
    country: "Uganda",
    phone: "+256-XXX-XXX-XXX",
    email: "cueva@hugamara.com",
    timezone: "Africa/Kampala",
    currency: "UGX",
    isActive: true,
    settings: {
      theme: "dark",
      music: "latin",
      dressCode: "smart_casual",
    },
    operatingHours: {
      monday: { isOpen: false, open: "", close: "" },
      tuesday: { isOpen: false, open: "", close: "" },
      wednesday: { isOpen: true, open: "19:00", close: "03:00" },
      thursday: { isOpen: true, open: "19:00", close: "03:00" },
      friday: { isOpen: true, open: "19:00", close: "03:00" },
      saturday: { isOpen: true, open: "19:00", close: "03:00" },
      sunday: { isOpen: false, open: "", close: "" },
    },
    capacity: 120,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Patio Bella",
    code: "PATIO",
    type: "restaurant",
    address: "Arena Mall, Kampala",
    city: "Kampala",
    country: "Uganda",
    phone: "+256-XXX-XXX-XXX",
    email: "patio@hugamara.com",
    timezone: "Africa/Kampala",
    currency: "UGX",
    isActive: true,
    settings: {
      theme: "elegant",
      cuisine: "italian",
      dressCode: "smart_casual",
    },
    operatingHours: {
      monday: { isOpen: true, open: "07:00", close: "22:00" },
      tuesday: { isOpen: true, open: "07:00", close: "22:00" },
      wednesday: { isOpen: true, open: "07:00", close: "22:00" },
      thursday: { isOpen: true, open: "07:00", close: "22:00" },
      friday: { isOpen: true, open: "07:00", close: "23:00" },
      saturday: { isOpen: true, open: "08:00", close: "23:00" },
      sunday: { isOpen: true, open: "08:00", close: "22:00" },
    },
    capacity: 80,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Maze",
    code: "MAZE",
    type: "restaurant",
    address: "Forest Mall, Kampala",
    city: "Kampala",
    country: "Uganda",
    phone: "+256-XXX-XXX-XXX",
    email: "maze@hugamara.com",
    timezone: "Africa/Kampala",
    currency: "UGX",
    isActive: true,
    settings: {
      theme: "modern",
      cuisine: "international",
      dressCode: "casual",
    },
    operatingHours: {
      monday: { isOpen: true, open: "08:00", close: "21:00" },
      tuesday: { isOpen: true, open: "08:00", close: "21:00" },
      wednesday: { isOpen: true, open: "08:00", close: "21:00" },
      thursday: { isOpen: true, open: "08:00", close: "21:00" },
      friday: { isOpen: true, open: "08:00", close: "22:00" },
      saturday: { isOpen: true, open: "09:00", close: "22:00" },
      sunday: { isOpen: true, open: "09:00", close: "21:00" },
    },
    capacity: 60,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "The Maze Bistro",
    code: "MAZE-BISTRO",
    type: "restaurant",
    address: "Mbuya Ismael Road, Kampala",
    city: "Kampala",
    country: "Uganda",
    phone: "+256-XXX-XXX-XXX",
    email: "mazebistro@hugamara.com",
    timezone: "Africa/Kampala",
    currency: "UGX",
    isActive: true,
    settings: {
      theme: "cozy",
      cuisine: "french_bistro",
      dressCode: "smart_casual",
    },
    operatingHours: {
      monday: { isOpen: true, open: "07:00", close: "21:00" },
      tuesday: { isOpen: true, open: "07:00", close: "21:00" },
      wednesday: { isOpen: true, open: "07:00", close: "21:00" },
      thursday: { isOpen: true, open: "07:00", close: "21:00" },
      friday: { isOpen: true, open: "07:00", close: "22:00" },
      saturday: { isOpen: true, open: "08:00", close: "22:00" },
      sunday: { isOpen: true, open: "08:00", close: "21:00" },
    },
    capacity: 45,
  },
];

async function addOutlets() {
  try {
    console.log("Adding outlets...");

    for (const outletData of outlets) {
      const [outlet, created] = await Outlet.findOrCreate({
        where: { id: outletData.id },
        defaults: outletData,
      });

      if (created) {
        console.log(`✅ Created outlet: ${outlet.name}`);
      } else {
        console.log(`⚠️  Outlet already exists: ${outlet.name}`);
      }
    }

    console.log("✅ All outlets added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding outlets:", error);
    process.exit(1);
  }
}

addOutlets();
