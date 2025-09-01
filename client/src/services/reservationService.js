import { createCRUDService } from "./apiService";

const reservationService = {
  ...createCRUDService("reservations"),

  // Get reservations by outlet
  getByOutlet: (outletId, params = {}) =>
    createCRUDService("reservations").getAll({ outletId, ...params }),

  // Get reservations by date range
  getByDateRange: (outletId, startDate, endDate) =>
    createCRUDService("reservations").getAll({
      outletId,
      startDate,
      endDate,
    }),

  // Get upcoming reservations
  getUpcoming: (outletId, limit = 10) =>
    createCRUDService("reservations").getAll({
      outletId,
      upcoming: true,
      limit,
    }),

  // Confirm reservation
  confirm: (id) =>
    createCRUDService("reservations").update(id, { status: "confirmed" }),

  // Cancel reservation
  cancel: (id, reason) =>
    createCRUDService("reservations").update(id, {
      status: "cancelled",
      cancellationReason: reason,
    }),

  // Check table availability
  checkAvailability: (outletId, date, time, partySize) =>
    createCRUDService("reservations").getAll({
      outletId,
      date,
      time,
      partySize,
      checkAvailability: true,
    }),
};

export default reservationService;
