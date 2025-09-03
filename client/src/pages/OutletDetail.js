import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, Save } from "lucide-react";
import { outletsAPI } from "../services/apiClient";
import { useToast } from "../components/ui/ToastProvider";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const OutletDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [outlet, setOutlet] = useState(null);
  const [stats, setStats] = useState(null);
  const [hours, setHours] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [oRes, sRes] = await Promise.allSettled([
          outletsAPI.getById(id),
          outletsAPI.getStats(id),
        ]);

        if (oRes.status === "fulfilled") {
          const outletData = oRes.value?.data?.outlet || oRes.value?.data;
          setOutlet(outletData);
          const initialHours = outletData?.operatingHours || {};
          const normalized = {};
          DAYS.forEach((d) => {
            const v = initialHours[d] || {};
            normalized[d] = {
              isOpen: Boolean(v.isOpen),
              open: v.open || "09:00",
              close: v.close || "17:00",
            };
          });
          setHours(normalized);
        } else {
          console.error("Failed to load outlet detail:", oRes.reason);
          showError(
            "Failed to load outlet",
            oRes.reason?.response?.data?.message || ""
          );
        }

        if (sRes.status === "fulfilled") {
          const statsData = sRes.value?.data || {};
          setStats(statsData);
        } else {
          // Stats failing should not block the page
          console.warn("Outlet stats unavailable:", sRes.reason);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleHoursChange = (day, field, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: field === "isOpen" ? !!value : value },
    }));
  };

  const handleSaveHours = async () => {
    try {
      setSaving(true);
      setFormErrors({});
      // Backend PUT /outlets/:id requires name, code, and type in the payload
      const payload = {
        name: outlet?.name || "",
        code: outlet?.code || "",
        type: outlet?.type || "restaurant",
        operatingHours: hours,
      };
      const res = await outletsAPI.update(id, payload);
      const updated = res?.data?.outlet || res?.data;
      setOutlet(updated);
      showSuccess("Operating hours updated", "Saved successfully");
    } catch (err) {
      const data = err?.response?.data;
      const details = data?.errors || data?.details || [];
      if (Array.isArray(details)) {
        const mapped = {};
        details.forEach((d) => {
          if (d?.field) mapped[d.field] = d.message;
        });
        setFormErrors(mapped);
      }
      showError("Save failed", data?.message || "Validation failed");
    } finally {
      setSaving(false);
    }
  };

  const kpis = useMemo(() => {
    return {
      totalUsers: stats?.stats?.totalUsers ?? stats?.totalUsers ?? 0,
      isOpen: stats?.stats?.isOpen ?? stats?.isOpen ?? false,
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  if (!outlet) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">{outlet.name}</h1>
        </div>
        <div className="text-sm text-gray-600">
          <span className="mr-3">Code: {outlet.code}</span>
          <span className="mr-3 capitalize">Type: {outlet.type}</span>
          <span className="mr-3">Timezone: {outlet.timezone}</span>
          <span>Currency: {outlet.currency}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
            <div className="text-xs text-gray-500">Staff</div>
            <div className="text-lg font-semibold text-gray-900">
              {kpis.totalUsers}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
            <div className="text-xs text-gray-500">Status</div>
            <div
              className={`text-sm font-semibold ${
                kpis.isOpen ? "text-green-600" : "text-red-600"
              }`}
            >
              {kpis.isOpen ? "Open" : "Closed"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Operating Hours
          </h2>
          <button
            onClick={handleSaveHours}
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Close
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open?
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {DAYS.map((day) => (
                <tr key={day}>
                  <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                    {capitalize(day)}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={hours[day]?.open || ""}
                      onChange={(e) =>
                        handleHoursChange(day, "open", e.target.value)
                      }
                      className="form-input w-32"
                      disabled={!hours[day]?.isOpen}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={hours[day]?.close || ""}
                      onChange={(e) =>
                        handleHoursChange(day, "close", e.target.value)
                      }
                      className="form-input w-32"
                      disabled={!hours[day]?.isOpen}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={!!hours[day]?.isOpen}
                      onChange={(e) =>
                        handleHoursChange(day, "isOpen", e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {formErrors.operatingHours && (
          <div className="text-xs text-red-600 mt-2">
            {formErrors.operatingHours}
          </div>
        )}
      </div>

      {Array.isArray(outlet?.users) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outlet.users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                      {u.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletDetail;
