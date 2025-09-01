import React, { useEffect, useState } from "react";
import { Table as TableIcon, Plus, Edit, Trash2, Search } from "lucide-react";
import { tablesAPI, outletsAPI } from "../services/apiClient";
import { useToast } from "../components/ui/ToastProvider";

const Tables = () => {
  const { success: showSuccess, error: showError } = useToast();

  const [items, setItems] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOutlet, setFilterOutlet] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const emptyForm = {
    outletId: "",
    tableNumber: "",
    name: "",
    capacity: 2,
    minCapacity: 1,
    maxCapacity: 8,
    tableType: "standard",
    status: "available",
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    load();
    loadOutlets();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await tablesAPI.getAll(
        filterOutlet ? { outletId: filterOutlet } : {}
      );
      const list = res?.data?.tables || res?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      showError("Failed to load tables", err?.response?.data?.message || "");
    } finally {
      setLoading(false);
    }
  };

  const loadOutlets = async () => {
    try {
      const res = await outletsAPI.getAll();
      const list = res?.data?.outlets || res?.data || [];
      setOutlets(Array.isArray(list) ? list : []);
    } catch (err) {
      // best-effort, ignore
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setShowCreate(true);
  };

  const openEdit = (row) => {
    setSelected(row);
    setForm({
      outletId: row.outletId,
      tableNumber: row.tableNumber,
      name: row.name || "",
      capacity: row.capacity,
      minCapacity: row.minCapacity,
      maxCapacity: row.maxCapacity,
      tableType: row.tableType,
      status: row.status,
      isActive: row.isActive,
    });
    setFormErrors({});
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});
      const res = await tablesAPI.create(form);
      const created = res?.data?.table || res?.data;
      if (created?.id) setItems((prev) => [created, ...prev]);
      else await load();
      showSuccess("Table created", created.tableNumber);
      setShowCreate(false);
      setForm(emptyForm);
    } catch (err) {
      const data = err?.response?.data;
      const details = data?.errors || data?.details || [];
      const mapped = {};
      details.forEach((d) => {
        if (d?.field) mapped[d.field] = d.message;
      });
      setFormErrors(mapped);
      showError("Create failed", data?.message || "Validation failed");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});
      const res = await tablesAPI.update(selected.id, form);
      const updated = res?.data?.table || res?.data;
      if (updated?.id)
        setItems((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      else await load();
      showSuccess("Table updated", updated.tableNumber);
      setShowEdit(false);
      setSelected(null);
    } catch (err) {
      const data = err?.response?.data;
      const details = data?.errors || data?.details || [];
      const mapped = {};
      details.forEach((d) => {
        if (d?.field) mapped[d.field] = d.message;
      });
      setFormErrors(mapped);
      showError("Update failed", data?.message || "Validation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete table?")) return;
    try {
      await tablesAPI.delete(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      showSuccess("Table deleted", "Marked out of service");
    } catch (err) {
      showError("Delete failed", err?.response?.data?.message || "");
    }
  };

  const filtered = items.filter((t) => {
    const s = search.toLowerCase();
    if (!s) return true;
    return (
      t.tableNumber?.toLowerCase().includes(s) ||
      t.name?.toLowerCase().includes(s) ||
      t.tableType?.toLowerCase().includes(s) ||
      t.status?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TableIcon className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
            <p className="text-gray-600">Manage seating tables and capacity</p>
          </div>
        </div>
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4" /> New Table
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full form-input"
              placeholder="Search number, name, type, status"
            />
          </div>
          <div>
            <select
              value={filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="w-full form-input"
            >
              <option value="">All Outlets</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <button onClick={load} className="btn-secondary w-full">
              Apply
            </button>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                setSearch("");
                setFilterOutlet("");
                load();
              }}
              className="btn-secondary w-full"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tables...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.tableNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.minCapacity}-{t.maxCapacity} (cap {t.capacity})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {t.tableType.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.status === "available"
                            ? "bg-green-100 text-green-800"
                            : t.status === "reserved"
                            ? "bg-yellow-100 text-yellow-800"
                            : t.status === "occupied"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                          onClick={() => openEdit(t)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                New Table
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Outlet
                  </label>
                  <select
                    value={form.outletId}
                    onChange={(e) =>
                      setForm({ ...form, outletId: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    required
                  >
                    <option value="">Select outlet</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.outletId && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.outletId}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Table Number
                  </label>
                  <input
                    value={form.tableNumber}
                    onChange={(e) =>
                      setForm({ ...form, tableNumber: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.tableNumber && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.tableNumber}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full form-input"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          capacity: parseInt(e.target.value || 0),
                        })
                      }
                      className="mt-1 w-full form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Min
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.minCapacity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          minCapacity: parseInt(e.target.value || 0),
                        })
                      }
                      className="mt-1 w-full form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.maxCapacity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          maxCapacity: parseInt(e.target.value || 0),
                        })
                      }
                      className="mt-1 w-full form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={form.tableType}
                    onChange={(e) =>
                      setForm({ ...form, tableType: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                  >
                    {[
                      "standard",
                      "booth",
                      "bar",
                      "high_top",
                      "outdoor",
                      "private",
                      "vip",
                      "wheelchair_accessible",
                    ].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                  >
                    {[
                      "available",
                      "occupied",
                      "reserved",
                      "cleaning",
                      "maintenance",
                      "out_of_service",
                    ].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Table
              </h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Outlet
                  </label>
                  <select
                    value={form.outletId}
                    onChange={(e) =>
                      setForm({ ...form, outletId: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    required
                  >
                    <option value="">Select outlet</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.outletId && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.outletId}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Table Number
                  </label>
                  <input
                    value={form.tableNumber}
                    onChange={(e) =>
                      setForm({ ...form, tableNumber: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.tableNumber && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.tableNumber}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full form-input"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          capacity: parseInt(e.target.value || 0),
                        })
                      }
                      className="mt-1 w-full form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Min
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.minCapacity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          minCapacity: parseInt(e.target.value || 0),
                        })
                      }
                      className="mt-1 w-full form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.maxCapacity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          maxCapacity: parseInt(e.target.value || 0),
                        })
                      }
                      className="mt-1 w-full form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={form.tableType}
                    onChange={(e) =>
                      setForm({ ...form, tableType: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                  >
                    {[
                      "standard",
                      "booth",
                      "bar",
                      "high_top",
                      "outdoor",
                      "private",
                      "vip",
                      "wheelchair_accessible",
                    ].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                  >
                    {[
                      "available",
                      "occupied",
                      "reserved",
                      "cleaning",
                      "maintenance",
                      "out_of_service",
                    ].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
