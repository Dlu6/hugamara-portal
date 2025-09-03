import api, { createResourceAPI } from "./apiClient";

class StaffService {
  constructor() {
    this.baseAPI = createResourceAPI("staff");
  }

  // Basic CRUD operations
  async getAllStaff(filters = {}) {
    try {
      const response = await this.baseAPI.getAll(filters);
      return response;
    } catch (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }
  }

  async getStaffById(id) {
    try {
      const response = await this.baseAPI.getById(id);
      return response;
    } catch (error) {
      console.error("Error fetching staff member:", error);
      throw error;
    }
  }

  async createStaff(staffData) {
    try {
      const response = await this.baseAPI.create(staffData);
      return response;
    } catch (error) {
      console.error("Error creating staff member:", error);
      throw error;
    }
  }

  async updateStaff(id, staffData) {
    try {
      const response = await this.baseAPI.update(id, staffData);
      return response;
    } catch (error) {
      console.error("Error updating staff member:", error);
      throw error;
    }
  }

  async deleteStaff(id) {
    try {
      const response = await this.baseAPI.delete(id);
      return response;
    } catch (error) {
      console.error("Error deleting staff member:", error);
      throw error;
    }
  }

  // Staff-specific operations
  async getStaffStats() {
    try {
      const response = await api.get("/staff/stats");
      return response;
    } catch (error) {
      console.error("Error fetching staff stats:", error);
      throw error;
    }
  }

  async searchStaff(query, filters = {}) {
    try {
      const response = await api.get("/staff/search", {
        params: { query, ...filters },
      });
      return response;
    } catch (error) {
      console.error("Error searching staff:", error);
      throw error;
    }
  }

  async getStaffByDepartment(department, filters = {}) {
    try {
      const response = await api.get("/staff/department", {
        params: { department, ...filters },
      });
      return response;
    } catch (error) {
      console.error("Error fetching staff by department:", error);
      throw error;
    }
  }

  async updateStaffStatus(id, status) {
    try {
      const response = await api.patch(`/staff/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error("Error updating staff status:", error);
      throw error;
    }
  }

  async updatePerformance(id, performanceData) {
    try {
      const response = await api.patch(
        `/staff/${id}/performance`,
        performanceData
      );
      return response;
    } catch (error) {
      console.error("Error updating staff performance:", error);
      throw error;
    }
  }

  async getStaffSchedule(id, dateRange) {
    try {
      const response = await api.get(`/staff/${id}/schedule`, {
        params: dateRange,
      });
      return response;
    } catch (error) {
      console.error("Error fetching staff schedule:", error);
      throw error;
    }
  }

  async updateStaffSchedule(id, scheduleData) {
    try {
      const response = await api.patch(`/staff/${id}/schedule`, scheduleData);
      return response;
    } catch (error) {
      console.error("Error updating staff schedule:", error);
      throw error;
    }
  }

  async getStaffAttendance(id, dateRange) {
    try {
      const response = await api.get(`/staff/${id}/attendance`, {
        params: dateRange,
      });
      return response;
    } catch (error) {
      console.error("Error fetching staff attendance:", error);
      throw error;
    }
  }

  async recordAttendance(id, attendanceData) {
    try {
      const response = await api.post(
        `/staff/${id}/attendance`,
        attendanceData
      );
      return response;
    } catch (error) {
      console.error("Error recording attendance:", error);
      throw error;
    }
  }

  async getStaffPayroll(id, period) {
    try {
      const response = await api.get(`/staff/${id}/payroll`, {
        params: period,
      });
      return response;
    } catch (error) {
      console.error("Error fetching staff payroll:", error);
      throw error;
    }
  }

  async generatePayroll(period, staffIds = []) {
    try {
      const response = await api.post("/staff/payroll/generate", {
        period,
        staffIds,
      });
      return response;
    } catch (error) {
      console.error("Error generating payroll:", error);
      throw error;
    }
  }

  // Validation methods
  validateStaffData(staffData) {
    const errors = {};

    if (!staffData.employeeId || staffData.employeeId.trim() === "") {
      errors.employeeId = "Employee ID is required";
    }

    if (!staffData.position || staffData.position.trim() === "") {
      errors.position = "Position is required";
    }

    if (!staffData.department) {
      errors.department = "Department is required";
    }

    if (!staffData.hireDate) {
      errors.hireDate = "Hire date is required";
    }

    if (
      staffData.payFrequency === "hourly" &&
      (!staffData.hourlyRate || staffData.hourlyRate <= 0)
    ) {
      errors.hourlyRate = "Hourly rate is required for hourly employees";
    }

    if (
      staffData.payFrequency === "salary" &&
      (!staffData.salary || staffData.salary <= 0)
    ) {
      errors.salary = "Salary is required for salaried employees";
    }

    if (staffData.emergencyContact) {
      if (
        !staffData.emergencyContact.name ||
        staffData.emergencyContact.name.trim() === ""
      ) {
        errors.emergencyContactName = "Emergency contact name is required";
      }
      if (
        !staffData.emergencyContact.phone ||
        staffData.emergencyContact.phone.trim() === ""
      ) {
        errors.emergencyContactPhone = "Emergency contact phone is required";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Utility methods
  formatStaffForDisplay(staffMember) {
    return {
      ...staffMember,
      fullName: `${staffMember.firstName} ${staffMember.lastName}`,
      departmentDisplay: this.formatDepartment(staffMember.department),
      statusDisplay: staffMember.isActive ? "Active" : "Inactive",
      payDisplay:
        staffMember.payFrequency === "hourly"
          ? `${this.formatCurrency(staffMember.hourlyRate)}/hour`
          : `${this.formatCurrency(staffMember.salary)}/year`,
      tenureDisplay: this.calculateTenure(staffMember.hireDate),
    };
  }

  calculateTenure(hireDate) {
    if (!hireDate) return "N/A";

    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now - hire);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? "s" : ""}${
        remainingMonths > 0
          ? ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`
          : ""
      }`;
    }
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Format department
  formatDepartment(department) {
    const departmentMap = {
      front_of_house: "Front of House",
      back_of_house: "Back of House",
      management: "Management",
      bar: "Bar",
      kitchen: "Kitchen",
      service: "Service",
      cleaning: "Cleaning",
      security: "Security",
      maintenance: "Maintenance",
      other: "Other",
    };
    return departmentMap[department] || department;
  }

  // Get department options
  getDepartmentOptions() {
    return [
      { value: "front_of_house", label: "Front of House" },
      { value: "back_of_house", label: "Back of House" },
      { value: "management", label: "Management" },
      { value: "bar", label: "Bar" },
      { value: "kitchen", label: "Kitchen" },
      { value: "service", label: "Service" },
      { value: "cleaning", label: "Cleaning" },
      { value: "security", label: "Security" },
      { value: "maintenance", label: "Maintenance" },
      { value: "other", label: "Other" },
    ];
  }

  // Get pay frequency options
  getPayFrequencyOptions() {
    return [
      { value: "hourly", label: "Hourly" },
      { value: "salary", label: "Salary" },
    ];
  }

  // Get relationship options for emergency contact
  getRelationshipOptions() {
    return [
      { value: "spouse", label: "Spouse" },
      { value: "parent", label: "Parent" },
      { value: "sibling", label: "Sibling" },
      { value: "child", label: "Child" },
      { value: "friend", label: "Friend" },
      { value: "other", label: "Other" },
    ];
  }

  // Get skill options
  getSkillOptions() {
    return [
      { value: "customer_service", label: "Customer Service" },
      { value: "food_preparation", label: "Food Preparation" },
      { value: "bartending", label: "Bartending" },
      { value: "waiting", label: "Waiting" },
      { value: "cleaning", label: "Cleaning" },
      { value: "cash_handling", label: "Cash Handling" },
      { value: "inventory_management", label: "Inventory Management" },
      { value: "team_leadership", label: "Team Leadership" },
      { value: "problem_solving", label: "Problem Solving" },
      { value: "multitasking", label: "Multitasking" },
    ];
  }

  // Get certification options
  getCertificationOptions() {
    return [
      { value: "food_safety", label: "Food Safety Certification" },
      { value: "alcohol_service", label: "Alcohol Service Certification" },
      { value: "first_aid", label: "First Aid Certification" },
      { value: "cpr", label: "CPR Certification" },
      { value: "fire_safety", label: "Fire Safety Certification" },
      { value: "customer_service", label: "Customer Service Certification" },
    ];
  }
}

const staffService = new StaffService();
export default staffService;
