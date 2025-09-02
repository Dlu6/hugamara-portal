import { Op } from "sequelize";
import { Reservation, Table } from "../models/index.js";

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
    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    await reservation.update(req.body);

    const updatedReservation = await Reservation.findByPk(id, {
      include: [
        { model: Table, as: "table", attributes: ["tableNumber", "capacity"] },
      ],
    });

    res.json({ reservation: updatedReservation });
  } catch (error) {
    console.error("Update reservation error:", error);
    res.status(500).json({ error: "Failed to update reservation" });
  }
};
