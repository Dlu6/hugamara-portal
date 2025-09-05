import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useToast } from "./ui/ToastProvider";

/**
 * Reusable Department Manager Component
 * Handles department selection and creation
 */
const DepartmentManager = ({
  departments = [],
  selectedDepartment,
  onDepartmentChange,
  onDepartmentAdd,
  canAddDepartments = false,
  placeholder = "Select Department",
  className = "",
  showAddButton = true,
}) => {
  const { success: showSuccess, error: showError } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
  });

  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) return;

    try {
      const department = {
        id: newDepartment.name.toLowerCase().replace(/\s+/g, "_"),
        name: newDepartment.name,
        description: newDepartment.description,
      };

      if (onDepartmentAdd) {
        await onDepartmentAdd(department);
      }

      setNewDepartment({ name: "", description: "" });
      setShowModal(false);
      showSuccess(
        "Department Added",
        `${department.name} has been added successfully`
      );
    } catch (error) {
      showError("Error", "Failed to add department");
    }
  };

  const handleModalClose = () => {
    setNewDepartment({ name: "", description: "" });
    setShowModal(false);
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{placeholder}</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        {canAddDepartments && showAddButton && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm flex items-center gap-1"
            title="Add New Department"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        )}
      </div>

      {/* Add Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-md w-full border border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Add New Department
                </h3>
                <button
                  onClick={handleModalClose}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddDepartment();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) =>
                      setNewDepartment((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Marketing, IT, Finance"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newDepartment.description}
                    onChange={(e) =>
                      setNewDepartment((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the department's role"
                    rows="3"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90"
                  >
                    Add Department
                  </button>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentManager;
