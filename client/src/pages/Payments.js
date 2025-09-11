import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Receipt,
  Smartphone,
  Banknote,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchPayments,
  fetchPaymentStats,
  fetchOrders,
  createPayment,
  updatePayment,
  deletePayment,
  processPayment,
  refundPayment,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingPayment,
  setViewingPayment,
  setRefundModal,
  setRefundData,
  setFilters,
  resetForm,
  clearError,
  selectPayments,
  selectPaymentStats,
  selectPaymentOrders,
  selectPaymentsLoading,
  selectPaymentsError,
  selectPaymentsFormData,
  selectPaymentsFormErrors,
  selectPaymentsShowForm,
  selectPaymentsEditingPayment,
  selectPaymentsViewingPayment,
  selectPaymentsRefundModal,
  selectPaymentsRefundData,
  selectPaymentsFilters,
} from "../store/slices/paymentsSlice";

const Payments = () => {
  const dispatch = useDispatch();
  const payments = useSelector(selectPayments);
  const stats = useSelector(selectPaymentStats);
  const orders = useSelector(selectPaymentOrders);
  const loading = useSelector(selectPaymentsLoading);
  const error = useSelector(selectPaymentsError);
  const formData = useSelector(selectPaymentsFormData);
  const formErrors = useSelector(selectPaymentsFormErrors);
  const showForm = useSelector(selectPaymentsShowForm);
  const editingPayment = useSelector(selectPaymentsEditingPayment);
  const viewingPayment = useSelector(selectPaymentsViewingPayment);
  const refundModal = useSelector(selectPaymentsRefundModal);
  const refundData = useSelector(selectPaymentsRefundData);
  const filters = useSelector(selectPaymentsFilters);

  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    dispatch(fetchPayments(filters));
    dispatch(fetchOrders());
    dispatch(fetchPaymentStats());
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      showError("Error", error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const openCreateModal = () => {
    dispatch(resetForm());
    dispatch(setShowForm(true));
  };

  const openEditModal = (payment) => {
    dispatch(
      setFormData({
        orderId: payment.orderId || "",
        amount: payment.amount || 0,
        currency: payment.currency || "UGX",
        paymentMethod: payment.paymentMethod || "cash",
        paymentStatus: payment.paymentStatus || "pending",
        transactionId: payment.transactionId || "",
        referenceNumber: payment.referenceNumber || "",
        cardType: payment.cardType || "",
        cardLast4: payment.cardLast4 || "",
        mobileMoneyProvider: payment.mobileMoneyProvider || "",
        mobileMoneyNumber: payment.mobileMoneyNumber || "",
        bankName: payment.bankName || "",
        accountNumber: payment.accountNumber || "",
        tipAmount: payment.tipAmount || 0,
        serviceCharge: payment.serviceCharge || 0,
        taxAmount: payment.taxAmount || 0,
        discountAmount: payment.discountAmount || 0,
        discountReason: payment.discountReason || "",
        notes: payment.notes || "",
      })
    );
    dispatch(setEditingPayment(payment));
    dispatch(setShowForm(true));
  };

  const openViewModal = (payment) => {
    dispatch(setViewingPayment(payment));
  };

  const openRefundModal = (payment) => {
    dispatch(setRefundModal(payment));
    dispatch(
      setRefundData({
        refundReason: "",
        refundAmount: payment.amount,
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setFormErrors({}));

      if (editingPayment) {
        await dispatch(
          updatePayment({ id: editingPayment.id, data: formData })
        ).unwrap();
        showSuccess("Payment updated successfully");
      } else {
        await dispatch(createPayment(formData)).unwrap();
        showSuccess("Payment created successfully");
      }

      dispatch(setShowForm(false));
      dispatch(resetForm());
      dispatch(fetchPayments(filters));
      dispatch(fetchPaymentStats());
    } catch (error) {
      console.error("Failed to save payment:", error);
      if (error?.response?.data?.details) {
        const errors = {};
        error.response.data.details.forEach((detail) => {
          errors[detail.field] = detail.message;
        });
        dispatch(setFormErrors(errors));
      } else {
        showError(
          "Failed to save payment",
          error?.response?.data?.message || ""
        );
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;

    try {
      await dispatch(deletePayment(id)).unwrap();
      showSuccess("Payment deleted successfully");
      dispatch(fetchPayments(filters));
      dispatch(fetchPaymentStats());
    } catch (error) {
      console.error("Failed to delete payment:", error);
      showError(
        "Failed to delete payment",
        error?.response?.data?.message || ""
      );
    }
  };

  const handleProcessPayment = async (id) => {
    try {
      await dispatch(processPayment({ id, data: {} })).unwrap();
      showSuccess("Payment processing initiated");
      dispatch(fetchPayments(filters));
    } catch (error) {
      console.error("Failed to process payment:", error);
      showError(
        "Failed to process payment",
        error?.response?.data?.message || ""
      );
    }
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        refundPayment({ id: refundModal.id, refundData })
      ).unwrap();
      showSuccess("Payment refunded successfully");
      dispatch(setRefundModal(null));
      dispatch(fetchPayments(filters));
      dispatch(fetchPaymentStats());
    } catch (error) {
      console.error("Failed to refund payment:", error);
      showError(
        "Failed to refund payment",
        error?.response?.data?.message || ""
      );
    }
  };

  const handleSearch = () => {
    dispatch(fetchPayments(filters));
  };

  const getMethodIcon = (method) => {
    const icons = {
      cash: Banknote,
      credit_card: CreditCard,
      debit_card: CreditCard,
      mobile_money: Smartphone,
      bank_transfer: Banknote,
      gift_card: CreditCard,
      voucher: Receipt,
    };
    const Icon = icons[method] || CreditCard;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-amber-500 bg-amber-900/20",
      processing: "text-blue-500 bg-blue-900/20",
      completed: "text-green-500 bg-green-900/20",
      failed: "text-red-500 bg-red-900/20",
      cancelled: "text-gray-500 bg-gray-900/20",
      refunded: "text-purple-500 bg-purple-900/20",
      partially_refunded: "text-orange-500 bg-orange-900/20",
    };
    return colors[status] || "text-neutral-500 bg-neutral-900/20";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      processing: RefreshCw,
      completed: CheckCircle,
      failed: XCircle,
      cancelled: XCircle,
      refunded: RefreshCw,
      partially_refunded: RefreshCw,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-3 w-3" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMethod = (method) => {
    const methodMap = {
      credit_card: "Credit Card",
      debit_card: "Debit Card",
      mobile_money: "Mobile Money",
      bank_transfer: "Bank Transfer",
      gift_card: "Gift Card",
    };
    return (
      methodMap[method] || method.charAt(0).toUpperCase() + method.slice(1)
    );
  };

  if (loading)
    return (
      <div className="p-6 bg-neutral-900 text-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading payments...</div>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-neutral-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Management</h1>
          <p className="text-neutral-400 mt-1">
            Manage payments, refunds, and payment processing
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Payments</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalPayments || 0}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.totalAmount || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-emerald-500">
                {stats.completedPayments || 0}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Avg Payment</p>
              <p className="text-2xl font-bold text-purple-500">
                {formatCurrency(stats.avgPayment || 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 p-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={filters.search}
                onChange={(e) =>
                  dispatch(setFilters({ search: e.target.value }))
                }
                className="pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg w-full text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              dispatch(setFilters({ paymentMethod: e.target.value }))
            }
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="gift_card">Gift Card</option>
            <option value="voucher">Voucher</option>
          </select>

          <select
            value={filters.paymentStatus}
            onChange={(e) =>
              dispatch(setFilters({ paymentStatus: e.target.value }))
            }
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => dispatch(setFilters({ dateFrom: e.target.value }))}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t border-neutral-700 hover:bg-neutral-750"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">
                        {payment.paymentNumber}
                      </div>
                      {payment.receiptNumber && (
                        <div className="text-sm text-neutral-400">
                          Receipt: {payment.receiptNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">
                      {payment.order?.orderNumber || "N/A"}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {payment.order?.orderType || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.paymentMethod)}
                      <span className="text-white">
                        {formatMethod(payment.paymentMethod)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">
                      {formatCurrency(payment.amount)}
                    </div>
                    {payment.tipAmount > 0 && (
                      <div className="text-sm text-neutral-400">
                        Tip: {formatCurrency(payment.tipAmount)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(
                        payment.paymentStatus
                      )}`}
                    >
                      {getStatusIcon(payment.paymentStatus)}
                      {payment.paymentStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(payment)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openEditModal(payment)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Edit Payment"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      {payment.paymentStatus === "pending" && (
                        <button
                          onClick={() => handleProcessPayment(payment.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm transition-colors"
                          title="Process Payment"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </button>
                      )}
                      {(payment.paymentStatus === "completed" ||
                        payment.paymentStatus === "partially_refunded") && (
                        <button
                          onClick={() => openRefundModal(payment)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-sm transition-colors"
                          title="Refund Payment"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      )}
                      {payment.paymentStatus === "pending" && (
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                          title="Delete Payment"
                        >
                          <Trash2 className="h-3 w-3" />
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingPayment ? "Edit Payment" : "Add Payment"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Order *
                    </label>
                    <select
                      value={formData.orderId}
                      onChange={(e) =>
                        dispatch(setFormData({ orderId: e.target.value }))
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.orderId
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    >
                      <option value="">Select Order</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.orderNumber} -{" "}
                          {formatCurrency(order.totalAmount)}
                        </option>
                      ))}
                    </select>
                    {formErrors.orderId && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.orderId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            amount: parseFloat(e.target.value) || 0,
                          })
                        )
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.amount
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      min="0"
                      step="0.01"
                      required
                    />
                    {formErrors.amount && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.amount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Payment Method *
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
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.paymentMethod
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="gift_card">Gift Card</option>
                      <option value="voucher">Voucher</option>
                    </select>
                    {formErrors.paymentMethod && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.paymentMethod}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            paymentStatus: e.target.value,
                          })
                        )
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={formData.transactionId}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            transactionId: e.target.value,
                          })
                        )
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            referenceNumber: e.target.value,
                          })
                        )
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Tip Amount
                    </label>
                    <input
                      type="number"
                      value={formData.tipAmount}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            tipAmount: parseFloat(e.target.value) || 0,
                          })
                        )
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Service Charge
                    </label>
                    <input
                      type="number"
                      value={formData.serviceCharge}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            serviceCharge: parseFloat(e.target.value) || 0,
                          })
                        )
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Tax Amount
                    </label>
                    <input
                      type="number"
                      value={formData.taxAmount}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            taxAmount: parseFloat(e.target.value) || 0,
                          })
                        )
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Discount Amount
                    </label>
                    <input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            discountAmount: parseFloat(e.target.value) || 0,
                          })
                        )
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      dispatch(setFormData({ notes: e.target.value }))
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingPayment ? "Update Payment" : "Add Payment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(setShowForm(false))}
                    className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold text-white mb-4">
              Refund Payment - {refundModal.paymentNumber}
            </h2>
            <form onSubmit={handleRefund}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Original Amount
                  </label>
                  <div className="text-white font-medium">
                    {formatCurrency(refundModal.amount)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    value={refundData.refundAmount}
                    onChange={(e) =>
                      dispatch(
                        setRefundData({
                          refundAmount: parseFloat(e.target.value) || 0,
                        })
                      )
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max={refundModal.amount}
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Refund Reason *
                  </label>
                  <textarea
                    value={refundData.refundReason}
                    onChange={(e) =>
                      dispatch(
                        setRefundData({
                          refundReason: e.target.value,
                        })
                      )
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Process Refund
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setRefundModal(null))}
                  className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">
              Payment Details - {viewingPayment.paymentNumber}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-neutral-400">Order:</span>
                <span className="text-white ml-2">
                  {viewingPayment.order?.orderNumber || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Amount:</span>
                <span className="text-white ml-2">
                  {formatCurrency(viewingPayment.amount)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Method:</span>
                <span className="text-white ml-2">
                  {formatMethod(viewingPayment.paymentMethod)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    viewingPayment.paymentStatus
                  )}`}
                >
                  {viewingPayment.paymentStatus.replace("_", " ")}
                </span>
              </div>
              {viewingPayment.transactionId && (
                <div>
                  <span className="text-neutral-400">Transaction ID:</span>
                  <span className="text-white ml-2">
                    {viewingPayment.transactionId}
                  </span>
                </div>
              )}
              {viewingPayment.receiptNumber && (
                <div>
                  <span className="text-neutral-400">Receipt:</span>
                  <span className="text-white ml-2">
                    {viewingPayment.receiptNumber}
                  </span>
                </div>
              )}
              {viewingPayment.tipAmount > 0 && (
                <div>
                  <span className="text-neutral-400">Tip:</span>
                  <span className="text-white ml-2">
                    {formatCurrency(viewingPayment.tipAmount)}
                  </span>
                </div>
              )}
              {viewingPayment.notes && (
                <div>
                  <span className="text-neutral-400">Notes:</span>
                  <p className="text-white mt-1">{viewingPayment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => dispatch(setViewingPayment(null))}
                className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
