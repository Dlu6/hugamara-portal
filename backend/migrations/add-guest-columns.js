import { sequelize } from "../config/database.js";

async function addGuestColumns() {
  try {
    console.log("🔄 Adding missing columns to guests table...");

    // Check if outlet_id column exists
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'guests' AND COLUMN_NAME = 'outlet_id'
    `);

    if (columns.length === 0) {
      console.log("Adding outlet_id column...");
      await sequelize.query(`
        ALTER TABLE guests 
        ADD COLUMN outlet_id VARCHAR(36) NOT NULL DEFAULT '280813e4-86c8-11f0-bd5e-4df9fbfe051d'
      `);
    } else {
      console.log("outlet_id column already exists");
    }

    // Check if total_spent column exists
    const [totalSpentColumns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'guests' AND COLUMN_NAME = 'total_spent'
    `);

    if (totalSpentColumns.length === 0) {
      console.log("Adding total_spent column...");
      await sequelize.query(`
        ALTER TABLE guests 
        ADD COLUMN total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00
      `);
    } else {
      console.log("total_spent column already exists");
    }

    // Add foreign key constraint for outlet_id if it doesn't exist
    try {
      await sequelize.query(`
        ALTER TABLE guests 
        ADD CONSTRAINT fk_guests_outlet_id 
        FOREIGN KEY (outlet_id) REFERENCES outlets(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log("Foreign key constraint added");
    } catch (error) {
      if (
        error.message.includes("Duplicate key name") ||
        error.message.includes("already exists")
      ) {
        console.log("Foreign key constraint already exists");
      } else {
        console.log("Foreign key constraint error:", error.message);
      }
    }

    console.log("✅ Guest columns added successfully");
  } catch (error) {
    console.error("❌ Error adding guest columns:", error.message);
    throw error;
  }
}

// Run the migration
addGuestColumns()
  .then(() => {
    console.log("✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
