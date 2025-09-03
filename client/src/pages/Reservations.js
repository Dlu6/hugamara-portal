import React, { useState, useEffect } from "react";
import { Calendar, Plus, Search, Filter } from "lucide-react";
import {
  reservationsAPI,
  tablesAPI,
  guestsAPI,
  ordersAPI,
} from "../services/apiClient";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/ToastProvider";

const Reservations = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    guestId: "",
    reservationDate: "",
    reservationTime: "",
    partySize: 1,
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [tables, setTables] = useState([]);
  const [seatModal, setSeatModal] = useState({
    open: false,
    reservationId: null,
    tableId: "",
  });
  const [guests, setGuests] = useState([]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestForm, setGuestForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [guestErrors, setGuestErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
    fetchTables();
    fetchGuests();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationsAPI.getAll();
      const list = response?.data?.reservations || response?.data || [];
      setReservations(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      showError(
        "Failed to load reservations",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await tablesAPI.getAll();
      const list = res?.data?.tables || res?.data || [];
      setTables(Array.isArray(list) ? list : []);
    } catch (err) {
      // non-blocking
    }
  };

  const fetchGuests = async () => {
    try {
      const res = await guestsAPI.getAll({ limit: 100 });
      const list = res?.data?.guests || res?.data || [];
      setGuests(Array.isArray(list) ? list : []);
    } catch (err) {
      // non-blocking
    }
  };

  const handleCreateGuest = async () => {
    try {
      setGuestErrors({});
      const res = await guestsAPI.create(guestForm);
      const created = res?.data?.guest || res?.data;
      if (created?.id) {
        setGuests((prev) => [created, ...prev]);
        setFormData((prev) => ({ ...prev, guestId: created.id }));
        setShowGuestForm(false);
        setGuestForm({ firstName: "", lastName: "", phone: "" });
        showSuccess("Guest added", "Guest created and selected");
      } else {
        await fetchGuests();
      }
    } catch (error) {
      const data = error?.response?.data;
      const details = data?.errors || data?.details || [];
      if (Array.isArray(details)) {
        const mapped = {};
        details.forEach((d) => {
          if (d?.field) mapped[d.field] = d.message;
        });
        setGuestErrors(mapped);
      }
      showError("Create guest failed", data?.message || "Validation failed");
    }
  };

  const handleCreateOrder = async (reservation) => {
    try {
      const orderData = {
        orderType: "dine_in",
        tableId: reservation.tableId,
        reservationId: reservation.id,
        guestId: reservation.guestId,
        priority: "normal",
        specialInstructions: `Order for reservation ${reservation.reservationNumber}`,
      };

      const response = await ordersAPI.create(orderData);
      showSuccess(
        "Order created",
        `Order created for reservation ${reservation.reservationNumber}`
      );

      // Navigate to orders page to view the new order
      navigate("/orders");
    } catch (error) {
      console.error("Failed to create order:", error);
      showError("Order creation failed", error?.response?.data?.message || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});
      const res = await reservationsAPI.create(formData);
      setShowForm(false);
      setFormData({
        guestId: "",
        reservationDate: "",
        reservationTime: "",
        partySize: 1,
        specialRequests: "",
      });
      const created = res?.data?.reservation || res?.data;
      if (created?.id) {
        setReservations((prev) => [created, ...prev]);
      } else {
        fetchReservations();
      }
      showSuccess("Reservation created", "Saved successfully");
    } catch (error) {
      console.error("Failed to create reservation:", error);
      const data = error?.response?.data;
      const details = data?.errors || data?.details || [];
      if (Array.isArray(details)) {
        const mapped = {};
        details.forEach((d) => {
          if (d?.field) mapped[d.field] = d.message;
        });
        setFormErrors(mapped);
      }
      showError("Create failed", data?.message || "Validation failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await reservationsAPI.update(id, { status });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      showSuccess("Status updated", status);
    } catch (error) {
      console.error("Failed to update reservation:", error);
      showError("Update failed", error?.response?.data?.message || "");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Reservation
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 text-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-bold mb-4">New Reservation</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-neutral-300">Guest</label>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-neutral-800 border border-neutral-700"
                      onClick={() => setShowGuestForm((v) => !v)}
                    >
                      {showGuestForm ? "Close" : "Quick add"}
                    </button>
                  </div>
                  {guests.length === 0 && !showGuestForm && (
                    <div className="text-xs text-neutral-400 mb-2">
                      No guests found. Use Quick add to create one.
                    </div>
                  )}
                  <select
                    value={formData.guestId}
                    onChange={(e) =>
                      setFormData({ ...formData, guestId: e.target.value })
                    }
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                    required
                  >
                    <option value="">Select guest</option>
                    {guests.map((g) => (
                      <option key={g.id} value={g.id} className="text-gray-900">
                        {g.firstName} {g.lastName}{" "}
                        {g.phone ? `• ${g.phone}` : ""}
                      </option>
                    ))}
                  </select>
                  {formErrors.guestId && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.guestId}
                    </div>
                  )}
                  {showGuestForm && (
                    <div className="mt-3 space-y-2 p-3 rounded bg-neutral-800 border border-neutral-700">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="First name"
                          value={guestForm.firstName}
                          onChange={(e) =>
                            setGuestForm({
                              ...guestForm,
                              firstName: e.target.value,
                            })
                          }
                          className="w-1/2 p-2 border rounded bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Last name"
                          value={guestForm.lastName}
                          onChange={(e) =>
                            setGuestForm({
                              ...guestForm,
                              lastName: e.target.value,
                            })
                          }
                          className="w-1/2 p-2 border rounded bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                          required
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={guestForm.phone}
                        onChange={(e) =>
                          setGuestForm({ ...guestForm, phone: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                      />
                      {(guestErrors.firstName ||
                        guestErrors.lastName ||
                        guestErrors.phone) && (
                        <div className="text-xs text-red-400">
                          {guestErrors.firstName ||
                            guestErrors.lastName ||
                            guestErrors.phone}
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCreateGuest}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
                        >
                          Save guest
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGuestForm(false)}
                          className="bg-neutral-700 text-white px-3 py-1.5 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {formErrors.guestId && (
                  <div className="text-xs text-red-400">
                    {formErrors.guestId}
                  </div>
                )}
                <input
                  type="date"
                  value={formData.reservationDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reservationDate: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                  required
                />
                {formErrors.reservationDate && (
                  <div className="text-xs text-red-400">
                    {formErrors.reservationDate}
                  </div>
                )}
                <input
                  type="time"
                  value={formData.reservationTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reservationTime: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                  required
                />
                {formErrors.reservationTime && (
                  <div className="text-xs text-red-400">
                    {formErrors.reservationTime}
                  </div>
                )}
                <input
                  type="number"
                  placeholder="Party Size"
                  value={formData.partySize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partySize: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                  min="1"
                  required
                />
                {formErrors.partySize && (
                  <div className="text-xs text-red-400">
                    {formErrors.partySize}
                  </div>
                )}
                <textarea
                  placeholder="Special Requests"
                  value={formData.specialRequests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialRequests: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded shadow"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-neutral-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-neutral-900 rounded-lg shadow-lg border border-neutral-800">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reservations..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full bg-neutral-800 border-neutral-700 text-gray-100 placeholder-neutral-400"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-neutral-800 border-neutral-700 text-gray-100">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Party Size</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-t border-neutral-800"
                >
                  <td className="px-4 py-3">{reservation.reservationDate}</td>
                  <td className="px-4 py-3">{reservation.reservationTime}</td>
                  <td className="px-4 py-3">{reservation.partySize}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        reservation.status === "confirmed"
                          ? "bg-green-600/20 text-green-300"
                          : reservation.status === "pending"
                          ? "bg-amber-600/20 text-amber-300"
                          : reservation.status === "seated"
                          ? "bg-blue-600/20 text-blue-300"
                          : reservation.status === "completed"
                          ? "bg-emerald-600/20 text-emerald-300"
                          : reservation.status === "cancelled"
                          ? "bg-red-600/20 text-red-300"
                          : reservation.status === "no_show"
                          ? "bg-gray-600/20 text-gray-300"
                          : "bg-neutral-700 text-gray-200"
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={reservation.status}
                        onChange={(e) =>
                          updateStatus(reservation.id, e.target.value)
                        }
                        className="rounded px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 text-gray-100"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="seated">Seated</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {reservation.status === "confirmed" && (
                        <button
                          className="text-sm px-2 py-1 border border-neutral-700 bg-neutral-800 text-gray-100 rounded"
                          onClick={() =>
                            setSeatModal({
                              open: true,
                              reservationId: reservation.id,
                              tableId: "",
                            })
                          }
                        >
                          Seat
                        </button>
                      )}
                      {reservation.status === "seated" && (
                        <button
                          className="text-sm px-2 py-1 border border-green-700 bg-green-800 text-green-100 rounded ml-2"
                          onClick={() => handleCreateOrder(reservation)}
                        >
                          Create Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seat Reservation Modal */}
      {seatModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 text-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Assign Table</h2>
            <div className="space-y-4">
              <select
                value={seatModal.tableId}
                onChange={(e) =>
                  setSeatModal({ ...seatModal, tableId: e.target.value })
                }
                className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
              >
                <option value="">Select table</option>
                {tables
                  .filter((t) => t.status === "available" && t.isActive)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} • {t.minCapacity}-{t.maxCapacity}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  if (!seatModal.tableId) return;
                  try {
                    await reservationsAPI.update(seatModal.reservationId, {
                      status: "seated",
                      tableId: seatModal.tableId,
                    });
                    setReservations((prev) =>
                      prev.map((r) =>
                        r.id === seatModal.reservationId
                          ? {
                              ...r,
                              status: "seated",
                              tableId: seatModal.tableId,
                            }
                          : r
                      )
                    );
                    showSuccess("Reservation seated", "Table assigned");
                    setSeatModal({
                      open: false,
                      reservationId: null,
                      tableId: "",
                    });
                  } catch (err) {
                    showError(
                      "Seat failed",
                      err?.response?.data?.message || ""
                    );
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() =>
                  setSeatModal({
                    open: false,
                    reservationId: null,
                    tableId: "",
                  })
                }
                className="bg-neutral-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
