// create-contacts-table.mjs
import { sequelize } from "../config/sequelize.js";
import { up } from "../migrations/create_contacts_table.js";

async function runMigration() {
  const queryInterface = sequelize.getQueryInterface();
  console.log("Creating contacts table...");
  try {
    await up(queryInterface, sequelize.constructor);
    console.log("✅ Contacts table created successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();
