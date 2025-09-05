import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  fetchTables,
  fetchReservations,
  fetchGuests,
  fetchMenuItems,
  fetchOrderStats,
  setFormData,
  setFormErrors,
  setShowForm,
  setShowDetail,
  setShowMenuItems,
  setFilters,
  resetForm,
  clearError,
  selectOrders,
  selectSelectedOrder,
  selectTables,
  selectReservations,
  selectGuests,
  selectMenuItems,
  selectOrderStats,
  selectOrdersLoading,
  selectOrdersStatsLoading,
  selectOrdersError,
  selectOrdersFormData,
  selectOrdersFormErrors,
  selectOrdersShowForm,
  selectOrdersShowDetail,
  selectOrdersShowMenuItems,
  selectOrdersFilters,
} from "../store/slices/ordersSlice";

// StatCard component
const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
  <div className="bg-neutral-800 rounded-lg shadow-lg p-6 border border-neutral-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 bg-opacity-20`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Orders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const selectedOrder = useSelector(selectSelectedOrder);
  const tables = useSelector(selectTables);
  const reservations = useSelector(selectReservations);
  const guests = useSelector(selectGuests);
  const menuItems = useSelector(selectMenuItems);
  const stats = useSelector(selectOrderStats);
  const loading = useSelector(selectOrdersLoading);
  const statsLoading = useSelector(selectOrdersStatsLoading);
  const error = useSelector(selectOrdersError);
  const formData = useSelector(selectOrdersFormData);
  const formErrors = useSelector(selectOrdersFormErrors);
  const showForm = useSelector(selectOrdersShowForm);
  const showDetail = useSelector(selectOrdersShowDetail);
  const showMenuItems = useSelector(selectOrdersShowMenuItems);
  const filters = useSelector(selectOrdersFilters);

  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    dispatch(fetchOrders(filters));
    dispatch(fetchOrderStats(filters));
    dispatch(fetchTables());
    dispatch(fetchReservations());
    dispatch(fetchGuests());
    dispatch(fetchMenuItems());
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      showError("Error", error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setFormErrors({}));
      await dispatch(createOrder(formData)).unwrap();
      showSuccess("Order created", "Order saved successfully");
      dispatch(setShowForm(false));
      dispatch(resetForm());
      dispatch(fetchOrders(filters));
    } catch (error) {
      console.error("Failed to create order:", error);
      const data = error?.response?.data;
      const details = data?.errors || data?.details || [];
      if (Array.isArray(details)) {
        const mapped = {};
        details.forEach((d) => {
          if (d?.field) mapped[d.field] = d.message;
        });
        dispatch(setFormErrors(mapped));
      }
      showError("Create failed", data?.message || "Validation failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      showSuccess("Status updated", `Order status changed to ${status}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      showError("Update failed", error?.response?.data?.message || "");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await dispatch(deleteOrder(id)).unwrap();
      showSuccess("Order cancelled", "Order has been cancelled");
      dispatch(fetchOrders(filters));
    } catch (error) {
      console.error("Failed to delete order:", error);
      showError("Delete failed", error?.response?.data?.message || "");
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      await dispatch(fetchOrderById(orderId)).unwrap();
      dispatch(setShowDetail({ open: true, orderId }));
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

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <button
          onClick={() => dispatch(setShowForm(true))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsLoading ? (
          <div className="col-span-4 flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-neutral-400">Loading stats...</span>
          </div>
        ) : (
          <>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders || orders.length || 0}
              icon={ShoppingCart}
              color="blue"
              subtitle="All orders"
            />
            <StatCard
              title="Pending Orders"
              value={
                stats.pendingOrders ||
                orders.filter((o) => o.status === "pending").length ||
                0
              }
              icon={Clock}
              color="yellow"
              subtitle="Awaiting confirmation"
            />
            <StatCard
              title="Completed Orders"
              value={
                stats.completedOrders ||
                orders.filter((o) => o.status === "completed").length ||
                0
              }
              icon={CheckCircle}
              color="green"
              subtitle="Successfully served"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(
                stats.totalRevenue ||
                  orders.reduce(
                    (sum, order) => sum + (order.totalAmount || 0),
                    0
                  )
              )}
              icon={DollarSign}
              color="purple"
              subtitle="Total earnings"
            />
          </>
        )}
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
                      dispatch(setFormData({ orderType: e.target.value }))
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
                      dispatch(setFormData({ tableId: e.target.value }))
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
                      dispatch(
                        setFormData({
                          reservationId: e.target.value,
                        })
                      )
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
                      dispatch(setFormData({ guestId: e.target.value }))
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
                      dispatch(setFormData({ priority: e.target.value }))
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
                      dispatch(
                        setFormData({
                          paymentMethod: e.target.value,
                        })
                      )
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
                      dispatch(
                        setFormData({
                          specialInstructions: e.target.value,
                        })
                      )
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
                    onClick={() => dispatch(setShowMenuItems(!showMenuItems))}
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
                                dispatch(
                                  setFormData({
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
                                  })
                                );
                              } else {
                                dispatch(
                                  setFormData({
                                    items: [
                                      ...formData.items,
                                      {
                                        menuItemId: item.id,
                                        quantity: 1,
                                        unitPrice: item.price,
                                        totalPrice: item.price,
                                      },
                                    ],
                                  })
                                );
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
                                    dispatch(
                                      setFormData({
                                        items: formData.items.map((i, idx) =>
                                          idx === index
                                            ? {
                                                ...i,
                                                quantity: i.quantity - 1,
                                                totalPrice:
                                                  (i.quantity - 1) *
                                                  i.unitPrice,
                                              }
                                            : i
                                        ),
                                      })
                                    );
                                  } else {
                                    dispatch(
                                      setFormData({
                                        items: formData.items.filter(
                                          (_, idx) => idx !== index
                                        ),
                                      })
                                    );
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
                                  dispatch(
                                    setFormData({
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
                                    })
                                  );
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
                  onClick={() => dispatch(setShowForm(false))}
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
                onClick={() =>
                  dispatch(setShowDetail({ open: false, orderId: null }))
                }
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
                value={filters.search}
                onChange={(e) =>
                  dispatch(setFilters({ search: e.target.value }))
                }
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
