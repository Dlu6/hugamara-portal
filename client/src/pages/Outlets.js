import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { outletsAPI } from "../services/apiClient";
import { useToast } from "../components/ui/ToastProvider";

const Outlets = () => {
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();

  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "restaurant",
    timezone: "",
    currency: "UGX",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      setLoading(true);
      const res = await outletsAPI.getAll();
      const list = res?.data?.outlets || res?.data || [];
      setOutlets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch outlets:", err);
      showError(
        "Failed to load outlets",
        err?.response?.data?.message || "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "restaurant",
      timezone: "",
      currency: "UGX",
      isActive: true,
    });
    setFormErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (outlet) => {
    setSelectedOutlet(outlet);
    setFormErrors({});
    setFormData({
      name: outlet.name || "",
      code: outlet.code || "",
      type: outlet.type || "restaurant",
      timezone: outlet.timezone || "",
      currency: outlet.currency || "UGX",
      isActive: outlet.isActive,
    });
    setShowEditModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});
      const res = await outletsAPI.create({ ...formData });
      const created = res?.data?.outlet || res?.data;
      if (created?.id) {
        setOutlets((prev) => [created, ...prev]);
        showSuccess("Outlet created", created.name);
      } else {
        await fetchOutlets();
      }
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      const data = err?.response?.data;
      if (Array.isArray(data?.errors) || Array.isArray(data?.details)) {
        const details = data?.errors || data?.details || [];
        const mapped = {};
        details.forEach((d) => {
          if (d?.path?.[0]) mapped[d.path[0]] = d.msg || d.message;
          if (d?.field) mapped[d.field] = d.message;
        });
        setFormErrors(mapped);
      }
      showError("Create outlet failed", data?.message || "Validation failed");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});
      const res = await outletsAPI.update(selectedOutlet.id, { ...formData });
      const updated = res?.data?.outlet || res?.data;
      if (updated?.id) {
        setOutlets((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o))
        );
        showSuccess("Outlet updated", updated.name);
      } else {
        await fetchOutlets();
      }
      setShowEditModal(false);
      setSelectedOutlet(null);
      resetForm();
    } catch (err) {
      const data = err?.response?.data;
      if (Array.isArray(data?.errors) || Array.isArray(data?.details)) {
        const details = data?.errors || data?.details || [];
        const mapped = {};
        details.forEach((d) => {
          if (d?.path?.[0]) mapped[d.path[0]] = d.msg || d.message;
          if (d?.field) mapped[d.field] = d.message;
        });
        setFormErrors(mapped);
      }
      showError("Update outlet failed", data?.message || "Validation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this outlet?")) return;
    try {
      await outletsAPI.delete(id);
      setOutlets((prev) => prev.filter((o) => o.id !== id));
      showSuccess("Outlet deleted", "Outlet deactivated successfully");
    } catch (err) {
      showError(
        "Delete outlet failed",
        err?.response?.data?.message || "Please try again"
      );
    }
  };

  const filtered = outlets.filter((o) => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return true;
    return (
      o.name?.toLowerCase().includes(s) ||
      o.code?.toLowerCase().includes(s) ||
      o.type?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outlets</h1>
            <p className="text-gray-600">
              Manage locations and outlet settings
            </p>
          </div>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" />
          New Outlet
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full form-input"
            placeholder="Search outlets by name, code or type..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading outlets...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
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
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {o.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {o.timezone || ""} {o.currency ? `• ${o.currency}` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {o.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-900">
                      {o.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          o.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {o.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                          onClick={() => openEditModal(o)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="View"
                          onClick={() => navigate(`/outlets/${o.id}`)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          onClick={() => handleDelete(o.id)}
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
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Outlet
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.name && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.code && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.code}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="nightclub">Nightclub</option>
                    <option value="hq">HQ</option>
                  </select>
                  {formErrors.type && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.type}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    placeholder="Africa/Kampala"
                  />
                  {formErrors.timezone && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.timezone}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    placeholder="UGX"
                  />
                  {formErrors.currency && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.currency}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active outlet
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
      {showEditModal && selectedOutlet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Outlet
              </h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.name && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.code && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.code}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="nightclub">Nightclub</option>
                    <option value="hq">HQ</option>
                  </select>
                  {formErrors.type && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.type}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    placeholder="Africa/Kampala"
                  />
                  {formErrors.timezone && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.timezone}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="mt-1 w-full form-input"
                    placeholder="UGX"
                  />
                  {formErrors.currency && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.currency}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active outlet
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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

export default Outlets;
