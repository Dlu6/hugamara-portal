import { Table, Outlet } from "../models/index.js";

export const getAllTables = async (req, res) => {
  try {
    const { outletId } = req.query;
    const where = {};
    if (outletId) where.outletId = outletId;

    const tables = await Table.findAll({
      where,
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
      order: [["tableNumber", "ASC"]],
    });

    res.status(200).json({ tables: tables.map((t) => t.toJSON()) });
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while fetching tables",
    });
  }
};

export const getTableById = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findByPk(id, {
      include: [
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "code", "type"],
        },
      ],
    });
    if (!table)
      return res.status(404).json({
        error: "Table not found",
        message: "The requested table does not exist",
      });
    res.status(200).json({ table: table.toJSON() });
  } catch (error) {
    console.error("Get table error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while fetching table",
    });
  }
};

export const createTable = async (req, res) => {
  try {
    const payload = req.body;

    // unique per outlet: tableNumber
    const existing = await Table.findOne({
      where: { outletId: payload.outletId, tableNumber: payload.tableNumber },
    });
    if (existing) {
      return res.status(409).json({
        error: "Conflict",
        message: "Table number already exists for this outlet",
      });
    }

    const table = await Table.create(payload);
    res
      .status(201)
      .json({ message: "Table created successfully", table: table.toJSON() });
  } catch (error) {
    console.error("Create table error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while creating table",
    });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const table = await Table.findByPk(id);
    if (!table)
      return res.status(404).json({
        error: "Table not found",
        message: "The requested table does not exist",
      });

    // if changing tableNumber/outletId, enforce uniqueness within outlet
    if (
      (updateData.tableNumber &&
        updateData.tableNumber !== table.tableNumber) ||
      (updateData.outletId && updateData.outletId !== table.outletId)
    ) {
      const exists = await Table.findOne({
        where: {
          outletId: updateData.outletId || table.outletId,
          tableNumber: updateData.tableNumber || table.tableNumber,
        },
      });
      if (exists)
        return res.status(409).json({
          error: "Conflict",
          message: "Table number already exists for this outlet",
        });
    }

    await table.update(updateData);
    res
      .status(200)
      .json({ message: "Table updated successfully", table: table.toJSON() });
  } catch (error) {
    console.error("Update table error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while updating table",
    });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findByPk(id);
    if (!table)
      return res.status(404).json({
        error: "Table not found",
        message: "The requested table does not exist",
      });
    await table.update({ isActive: false, status: "out_of_service" });
    res.status(200).json({ message: "Table deleted successfully" });
  } catch (error) {
    console.error("Delete table error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while deleting table",
    });
  }
};
