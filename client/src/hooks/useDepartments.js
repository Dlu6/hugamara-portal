import { useState, useEffect } from "react";
import { useToast } from "../components/ui/ToastProvider";
import departmentService from "../services/departmentService";

/**
 * Custom hook for department management
 * Handles fetching, adding, and managing departments
 */
export const useDepartments = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default departments - in production, this would come from API
  const defaultDepartments = [
    {
      id: "front_of_house",
      name: "Front of House",
      description: "Customer-facing roles",
    },
    {
      id: "back_of_house",
      name: "Back of House",
      description: "Kitchen and preparation areas",
    },
    {
      id: "management",
      name: "Management",
      description: "Administrative and supervisory roles",
    },
    {
      id: "bar",
      name: "Bar",
      description: "Beverage service and bar operations",
    },
    {
      id: "kitchen",
      name: "Kitchen",
      description: "Food preparation and cooking",
    },
    {
      id: "service",
      name: "Service",
      description: "Table service and customer care",
    },
    {
      id: "cleaning",
      name: "Cleaning",
      description: "Maintenance and cleanliness",
    },
    {
      id: "security",
      name: "Security",
      description: "Safety and security operations",
    },
    {
      id: "maintenance",
      name: "Maintenance",
      description: "Facility maintenance and repairs",
    },
    {
      id: "other",
      name: "Other",
      description: "Other roles and responsibilities",
    },
  ];

  // Fetch departments from backend
  const fetchDepartments = async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await departmentService.getAllDepartments(filters);
      if (response.success) {
        setDepartments(response.data.departments || []);
      } else {
        throw new Error(response.message || "Failed to fetch departments");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching departments:", err);
      // Fallback to default departments on error
      setDepartments(defaultDepartments);
    } finally {
      setLoading(false);
    }
  };

  // Add new department
  const addDepartment = async (departmentData) => {
    try {
      // Validate department data
      const validation =
        departmentService.validateDepartmentData(departmentData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(", "));
      }

      const response = await departmentService.createDepartment(departmentData);
      if (response.success) {
        const newDepartment = response.data;
        setDepartments((prev) => [...prev, newDepartment]);
        showSuccess(
          "Department Added",
          `${newDepartment.name} has been added successfully`
        );
        return newDepartment;
      } else {
        throw new Error(response.message || "Failed to add department");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to add department");
      throw err;
    }
  };

  // Update department
  const updateDepartment = async (id, departmentData) => {
    try {
      // Validate department data
      const validation =
        departmentService.validateDepartmentData(departmentData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(", "));
      }

      const response = await departmentService.updateDepartment(
        id,
        departmentData
      );
      if (response.success) {
        const updatedDepartment = response.data;
        setDepartments((prev) =>
          prev.map((dept) => (dept.id === id ? updatedDepartment : dept))
        );
        showSuccess(
          "Department Updated",
          "Department has been updated successfully"
        );
        return updatedDepartment;
      } else {
        throw new Error(response.message || "Failed to update department");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to update department");
      throw err;
    }
  };

  // Delete department
  const deleteDepartment = async (id) => {
    try {
      const response = await departmentService.deleteDepartment(id);
      if (response.success) {
        setDepartments((prev) => prev.filter((dept) => dept.id !== id));
        showSuccess(
          "Department Deleted",
          "Department has been deleted successfully"
        );
      } else {
        throw new Error(response.message || "Failed to delete department");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to delete department");
      throw err;
    }
  };

  // Get department by ID
  const getDepartmentById = (id) => {
    return departments.find((dept) => dept.id === id);
  };

  // Format department name
  const formatDepartmentName = (departmentId) => {
    const dept = getDepartmentById(departmentId);
    return dept ? dept.name : departmentId;
  };

  // Load departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    formatDepartmentName,
  };
};
