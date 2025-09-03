import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import {
  ordersAPI,
  tablesAPI,
  reservationsAPI,
  guestsAPI,
  menuAPI,
} from "../services/apiClient";
import { useToast } from "../components/ui/ToastProvider";

const Orders = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState({ open: false, orderId: null });
  const [formData, setFormData] = useState({
    orderType: "dine_in",
    tableId: "",
    reservationId: "",
    guestId: "",
    priority: "normal",
    paymentMethod: "",
    specialInstructions: "",
    items: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showMenuItems, setShowMenuItems] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchReservations();
    fetchGuests();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      const list = response?.data?.orders || response?.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showError("Failed to load orders", error?.response?.data?.message || "");
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

  const fetchReservations = async () => {
    try {
      const res = await reservationsAPI.getAll();
      const list = res?.data?.reservations || res?.data || [];
      setReservations(Array.isArray(list) ? list : []);
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

  const fetchMenuItems = async () => {
    try {
      const res = await menuAPI.getAll({ limit: 100 });
      const list = res?.data?.menuItems || res?.data || [];
      setMenuItems(Array.isArray(list) ? list : []);
    } catch (err) {
      // non-blocking
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});
      const res = await ordersAPI.create(formData);
      setShowForm(false);
      setFormData({
        orderType: "dine_in",
        tableId: "",
        reservationId: "",
        guestId: "",
        priority: "normal",
        paymentMethod: "",
        specialInstructions: "",
        items: [],
      });
      const created = res?.data?.order || res?.data;
      if (created?.id) {
        setOrders((prev) => [created, ...prev]);
      } else {
        fetchOrders();
      }
      showSuccess("Order created", "Order saved successfully");
    } catch (error) {
      console.error("Failed to create order:", error);
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
      await ordersAPI.patch(`${id}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      showSuccess("Status updated", `Order status changed to ${status}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      showError("Update failed", error?.response?.data?.message || "");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await ordersAPI.delete(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showSuccess("Order cancelled", "Order has been cancelled");
    } catch (error) {
      console.error("Failed to delete order:", error);
      showError("Delete failed", error?.response?.data?.message || "");
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      const response = await ordersAPI.getById(orderId);
      setSelectedOrder(response?.data?.order || response?.data);
      setShowDetail({ open: true, orderId });
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      showError(
        "Failed to load order details",
        error?.response?.data?.message || ""
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-600/20 text-amber-300",
      confirmed: "bg-blue-600/20 text-blue-300",
      preparing: "bg-orange-600/20 text-orange-300",
      ready: "bg-green-600/20 text-green-300",
      served: "bg-emerald-600/20 text-emerald-300",
      completed: "bg-emerald-600/20 text-emerald-300",
      cancelled: "bg-red-600/20 text-red-300",
    };
    return colors[status] || "bg-neutral-700 text-gray-200";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount || 0);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Order
        </button>
      </div>

      {/* Create Order Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 text-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-bold mb-4">New Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-300">Order Type</label>
                  <select
                    value={formData.orderType}
                    onChange={(e) =>
                      setFormData({ ...formData, orderType: e.target.value })
                    }
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                    required
                  >
                    <option value="dine_in">Dine In</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="delivery">Delivery</option>
                    <option value="bar">Bar</option>
                    <option value="bottle_service">Bottle Service</option>
                  </select>
                  {formErrors.orderType && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.orderType}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-neutral-300">Table</label>
                  <select
                    value={formData.tableId}
                    onChange={(e) =>
                      setFormData({ ...formData, tableId: e.target.value })
                    }
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                  >
                    <option value="">Select table</option>
                    {tables
                      .filter((t) => t.isActive)
                      .map((t) => (
                        <option
                          key={t.id}
                          value={t.id}
                          className="text-gray-900"
                        >
                          {t.tableNumber} • {t.minCapacity}-{t.maxCapacity}
                        </option>
                      ))}
                  </select>
                  {formErrors.tableId && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.tableId}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-neutral-300">
                    Reservation
                  </label>
                  <select
                    value={formData.reservationId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reservationId: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                  >
                    <option value="">Select reservation</option>
                    {reservations
                      .filter((r) => r.status === "seated")
                      .map((r) => (
                        <option
                          key={r.id}
                          value={r.id}
                          className="text-gray-900"
                        >
                          {r.reservationNumber} • {r.partySize} people
                        </option>
                      ))}
                  </select>
                  {formErrors.reservationId && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.reservationId}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-neutral-300">Guest</label>
                  <select
                    value={formData.guestId}
                    onChange={(e) =>
                      setFormData({ ...formData, guestId: e.target.value })
                    }
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
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
                </div>

                <div>
                  <label className="text-sm text-neutral-300">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="vip">VIP</option>
                  </select>
                  {formErrors.priority && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.priority}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-neutral-300">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="gift_card">Gift Card</option>
                  </select>
                  {formErrors.paymentMethod && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.paymentMethod}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-neutral-300">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialInstructions: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                    placeholder="Any special instructions..."
                    rows={3}
                  />
                  {formErrors.specialInstructions && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.specialInstructions}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-neutral-300">Menu Items</label>
                  <button
                    type="button"
                    onClick={() => setShowMenuItems(!showMenuItems)}
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white text-left"
                  >
                    {formData.items.length > 0
                      ? `${formData.items.length} item(s) selected`
                      : "Select menu items (optional)"}
                  </button>
                  {showMenuItems && (
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded bg-neutral-800 border-neutral-700">
                      {menuItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 border-b border-neutral-700 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="text-white text-sm">
                              {item.name}
                            </div>
                            <div className="text-neutral-400 text-xs">
                              {item.category}
                            </div>
                          </div>
                          <div className="text-green-400 text-sm font-semibold">
                            {new Intl.NumberFormat("en-UG", {
                              style: "currency",
                              currency: "UGX",
                            }).format(item.price)}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const existingItem = formData.items.find(
                                (i) => i.menuItemId === item.id
                              );
                              if (existingItem) {
                                setFormData({
                                  ...formData,
                                  items: formData.items.map((i) =>
                                    i.menuItemId === item.id
                                      ? {
                                          ...i,
                                          quantity: i.quantity + 1,
                                          totalPrice:
                                            (i.quantity + 1) * i.unitPrice,
                                        }
                                      : i
                                  ),
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  items: [
                                    ...formData.items,
                                    {
                                      menuItemId: item.id,
                                      quantity: 1,
                                      unitPrice: item.price,
                                      totalPrice: item.price,
                                    },
                                  ],
                                });
                              }
                            }}
                            className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.items.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.items.map((item, index) => {
                        const menuItem = menuItems.find(
                          (m) => m.id === item.menuItemId
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-neutral-800 rounded"
                          >
                            <span className="text-white text-sm">
                              {menuItem?.name || "Unknown Item"}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    setFormData({
                                      ...formData,
                                      items: formData.items.map((i, idx) =>
                                        idx === index
                                          ? {
                                              ...i,
                                              quantity: i.quantity - 1,
                                              totalPrice:
                                                (i.quantity - 1) * i.unitPrice,
                                            }
                                          : i
                                      ),
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      items: formData.items.filter(
                                        (_, idx) => idx !== index
                                      ),
                                    });
                                  }
                                }}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                              >
                                -
                              </button>
                              <span className="text-white text-sm">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    items: formData.items.map((i, idx) =>
                                      idx === index
                                        ? {
                                            ...i,
                                            quantity: i.quantity + 1,
                                            totalPrice:
                                              (i.quantity + 1) * i.unitPrice,
                                          }
                                        : i
                                    ),
                                  });
                                }}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                              >
                                +
                              </button>
                              <span className="text-green-400 text-sm font-semibold">
                                {new Intl.NumberFormat("en-UG", {
                                  style: "currency",
                                  currency: "UGX",
                                }).format(item.totalPrice)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {formErrors.items && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.items}
                    </div>
                  )}
                </div>
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

      {/* Order Detail Modal */}
      {showDetail.open && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 text-white p-6 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-neutral-300">Order Number:</span>
                <p className="text-white">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-300">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <span className="text-sm text-neutral-300">Type:</span>
                <p className="text-white capitalize">
                  {selectedOrder.orderType?.replace("_", " ")}
                </p>
              </div>
              {selectedOrder.table && (
                <div>
                  <span className="text-sm text-neutral-300">Table:</span>
                  <p className="text-white">
                    {selectedOrder.table.tableNumber}
                  </p>
                </div>
              )}
              {selectedOrder.guest && (
                <div>
                  <span className="text-sm text-neutral-300">Guest:</span>
                  <p className="text-white">
                    {selectedOrder.guest.firstName}{" "}
                    {selectedOrder.guest.lastName}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-neutral-300">Total Amount:</span>
                <p className="text-white font-semibold">
                  {formatCurrency(selectedOrder.totalAmount)}
                </p>
              </div>
              {selectedOrder.specialInstructions && (
                <div>
                  <span className="text-sm text-neutral-300">
                    Special Instructions:
                  </span>
                  <p className="text-white">
                    {selectedOrder.specialInstructions}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowDetail({ open: false, orderId: null })}
                className="bg-neutral-700 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-neutral-900 rounded-lg shadow-lg border border-neutral-800">
        <div className="p-4 border-b border-neutral-800">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
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
                <th className="px-4 py-3 text-left">Order #</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Table</th>
                <th className="px-4 py-3 text-left">Guest</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-neutral-800">
                  <td className="px-4 py-3 text-white">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-white capitalize">
                    {order.orderType?.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {order.table ? order.table.tableNumber : "-"}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {order.guest
                      ? `${order.guest.firstName} ${order.guest.lastName}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-white font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetail(order.id)}
                        className="text-blue-400 hover:text-blue-300"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="rounded px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 text-gray-100"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="served">Served</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Cancel Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
