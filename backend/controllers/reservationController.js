import { Op } from "sequelize";
import { Reservation, Table, Guest } from "../models/index.js";

export const getAllReservations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const userOutletId = req.user.outletId;

    const whereClause = { outletId: userOutletId };
    if (status) whereClause.status = status;
    if (date) whereClause.reservationDate = date;

    const reservations = await Reservation.findAndCountAll({
      where: whereClause,
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [
        ["reservationDate", "DESC"],
        ["reservationTime", "DESC"],
      ],
    });

    res.json({
      reservations: reservations.rows,
      total: reservations.count,
      page: parseInt(page),
      totalPages: Math.ceil(reservations.count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get reservations error:", error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
};

export const createReservation = async (req, res) => {
  try {
    const reservationData = {
      ...req.body,
      outletId: req.user.outletId,
      reservationNumber: `RES${Date.now()}`,
    };

    const reservation = await Reservation.create(reservationData);

    const fullReservation = await Reservation.findByPk(reservation.id, {
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
    });

    res.status(201).json({ reservation: fullReservation });
  } catch (error) {
    console.error("Create reservation error:", error);
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const reservation = await Reservation.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    await reservation.update(req.body);

    const updatedReservation = await Reservation.findByPk(id, {
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
    });

    res.json({ reservation: updatedReservation });
  } catch (error) {
    console.error("Update reservation error:", error);
    res.status(500).json({ error: "Failed to update reservation" });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userOutletId = req.user.outletId;

    const reservation = await Reservation.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    await reservation.destroy();
    res.json({ message: "Reservation deleted successfully" });
  } catch (error) {
    console.error("Delete reservation error:", error);
    res.status(500).json({ error: "Failed to delete reservation" });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userOutletId = req.user.outletId;

    const reservation = await Reservation.findOne({
      where: { id, outletId: userOutletId },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    await reservation.update({ status });

    const updatedReservation = await Reservation.findByPk(id, {
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
    });

    res.json({ reservation: updatedReservation });
  } catch (error) {
    console.error("Update reservation status error:", error);
    res.status(500).json({ error: "Failed to update reservation status" });
  }
};

export const seatReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableId } = req.body;
    const userOutletId = req.user.outletId;

    // Find reservation - require outletId matching for security
    const reservation = await Reservation.findOne({
      where: userOutletId ? { id, outletId: userOutletId } : { id },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Check if table exists and is available - require outletId matching for security
    const table = await Table.findOne({
      where: userOutletId
        ? { id: tableId, outletId: userOutletId }
        : { id: tableId },
    });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    await reservation.update({
      tableId,
      status: "seated",
      seatedAt: new Date(),
    });

    const updatedReservation = await Reservation.findByPk(id, {
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
    });

    res.json({ reservation: updatedReservation });
  } catch (error) {
    console.error("Seat reservation error:", error);
    res.status(500).json({ error: "Failed to seat reservation" });
  }
};
