import api from "./apiClient";

/**
 * Department Service
 * Handles all department-related API calls
 */
class DepartmentService {
  constructor() {
    this.baseAPI = api;
  }

  /**
   * Get all departments with optional filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} API response
   */
  async getAllDepartments(filters = {}) {
    try {
      const response = await this.baseAPI.get("/departments", {
        params: filters,
      });
      return response.data || response;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  }

  /**
   * Get department by ID
   * @param {string} id - Department ID
   * @returns {Promise<Object>} API response
   */
  async getDepartmentById(id) {
    try {
      const response = await this.baseAPI.get(`/departments/${id}`);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching department:", error);
      throw error;
    }
  }

  /**
   * Create new department
   * @param {Object} departmentData - Department data
   * @returns {Promise<Object>} API response
   */
  async createDepartment(departmentData) {
    try {
      const response = await this.baseAPI.post("/departments", departmentData);
      return response.data || response;
    } catch (error) {
      console.error("Error creating department:", error);
      throw error;
    }
  }

  /**
   * Update department
   * @param {string} id - Department ID
   * @param {Object} departmentData - Updated department data
   * @returns {Promise<Object>} API response
   */
  async updateDepartment(id, departmentData) {
    try {
      const response = await this.baseAPI.put(
        `/departments/${id}`,
        departmentData
      );
      return response.data || response;
    } catch (error) {
      console.error("Error updating department:", error);
      throw error;
    }
  }

  /**
   * Delete department
   * @param {string} id - Department ID
   * @returns {Promise<Object>} API response
   */
  async deleteDepartment(id) {
    try {
      const response = await this.baseAPI.delete(`/departments/${id}`);
      return response.data || response;
    } catch (error) {
      console.error("Error deleting department:", error);
      throw error;
    }
  }

  /**
   * Get department statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} API response
   */
  async getDepartmentStats(filters = {}) {
    try {
      const response = await this.baseAPI.get("/departments/stats", {
        params: filters,
      });
      return response.data || response;
    } catch (error) {
      console.error("Error fetching department stats:", error);
      throw error;
    }
  }

  /**
   * Search departments
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} API response
   */
  async searchDepartments(query, filters = {}) {
    try {
      const response = await this.baseAPI.get("/departments", {
        params: { search: query, ...filters },
      });
      return response.data || response;
    } catch (error) {
      console.error("Error searching departments:", error);
      throw error;
    }
  }

  /**
   * Get departments by outlet
   * @param {string} outletId - Outlet ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} API response
   */
  async getDepartmentsByOutlet(outletId, filters = {}) {
    try {
      const response = await this.baseAPI.get("/departments", {
        params: { outletId, ...filters },
      });
      return response.data || response;
    } catch (error) {
      console.error("Error fetching departments by outlet:", error);
      throw error;
    }
  }

  /**
   * Validate department data
   * @param {Object} departmentData - Department data to validate
   * @returns {Object} Validation result
   */
  validateDepartmentData(departmentData) {
    const errors = {};

    if (!departmentData.name || !departmentData.name.trim()) {
      errors.name = "Department name is required";
    } else if (departmentData.name.trim().length < 2) {
      errors.name = "Department name must be at least 2 characters";
    } else if (departmentData.name.trim().length > 100) {
      errors.name = "Department name must be less than 100 characters";
    }

    if (departmentData.description && departmentData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Format department for display
   * @param {Object} department - Department object
   * @returns {Object} Formatted department
   */
  formatDepartmentForDisplay(department) {
    return {
      id: department.id,
      name: department.name,
      description: department.description || "",
      isActive: department.isActive,
      outletId: department.outletId,
      outlet: department.outlet,
      createdBy: department.createdBy,
      creator: department.creator,
      updatedBy: department.updatedBy,
      updater: department.updater,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };
  }

  /**
   * Get default department data for forms
   * @returns {Object} Default department data
   */
  getDefaultFormData() {
    return {
      name: "",
      description: "",
      outletId: null,
      isActive: true,
    };
  }
}

// Create and export a singleton instance
const departmentService = new DepartmentService();
export default departmentService;
