import api from "./apiClient";

// Menu management API endpoints
export const menuAPI = {
  // Get all menu items
  getAllMenuItems: (params = {}) => api.get("/menu", params),

  // Get menu item by ID
  getMenuItemById: (id) => api.get(`/menu/${id}`),

  // Create new menu item
  createMenuItem: (menuData) => api.post("/menu", menuData),

  // Update menu item
  updateMenuItem: (id, menuData) => api.put(`/menu/${id}`, menuData),

  // Delete menu item
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),

  // Get menu statistics
  getMenuStats: () => api.get("/menu/stats"),

  // Search menu items
  searchMenuItems: (query, params = {}) =>
    api.get("/menu", { search: query, ...params }),

  // Get menu items by category
  getMenuItemsByCategory: (category, params = {}) =>
    api.get("/menu", { category, ...params }),

  // Bulk operations
  bulkCreateMenuItems: (items) => api.post("/menu/bulk", { items }),
  bulkUpdateMenuItems: (updates) => api.put("/menu/bulk", { updates }),
  bulkDeleteMenuItems: (ids) => api.delete("/menu/bulk", { data: { ids } }),

  // Toggle availability
  toggleAvailability: (id) => api.patch(`/menu/${id}/toggle-availability`),

  // Toggle featured status
  toggleFeatured: (id) => api.patch(`/menu/${id}/toggle-featured`),
};

// Menu service class with business logic
class MenuService {
  // Get all menu items with optional filtering
  async getAllMenuItems(filters = {}) {
    try {
      const response = await menuAPI.getAllMenuItems(filters);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      throw error;
    }
  }

  // Get menu item by ID
  async getMenuItemById(id) {
    try {
      const response = await menuAPI.getMenuItemById(id);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch menu item:", error);
      throw error;
    }
  }

  // Create new menu item
  async createMenuItem(menuData) {
    try {
      const response = await menuAPI.createMenuItem(menuData);
      return response.data;
    } catch (error) {
      console.error("Failed to create menu item:", error);
      throw error;
    }
  }

  // Update menu item
  async updateMenuItem(id, menuData) {
    try {
      const response = await menuAPI.updateMenuItem(id, menuData);
      return response.data;
    } catch (error) {
      console.error("Failed to update menu item:", error);
      throw error;
    }
  }

  // Delete menu item
  async deleteMenuItem(id) {
    try {
      const response = await menuAPI.deleteMenuItem(id);
      return response.data;
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      throw error;
    }
  }

  // Get menu statistics
  async getMenuStats() {
    try {
      const response = await menuAPI.getMenuStats();
      return response.data;
    } catch (error) {
      console.error("Failed to fetch menu stats:", error);
      throw error;
    }
  }

  // Search menu items
  async searchMenuItems(query, filters = {}) {
    try {
      const response = await menuAPI.searchMenuItems(query, filters);
      return response.data;
    } catch (error) {
      console.error("Failed to search menu items:", error);
      throw error;
    }
  }

  // Get menu items by category
  async getMenuItemsByCategory(category, filters = {}) {
    try {
      const response = await menuAPI.getMenuItemsByCategory(category, filters);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch menu items by category:", error);
      throw error;
    }
  }

  // Toggle menu item availability
  async toggleAvailability(id) {
    try {
      const response = await menuAPI.toggleAvailability(id);
      return response.data;
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      throw error;
    }
  }

  // Toggle menu item featured status
  async toggleFeatured(id) {
    try {
      const response = await menuAPI.toggleFeatured(id);
      return response.data;
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      throw error;
    }
  }

  // Validate menu item data
  validateMenuItemData(menuData) {
    const errors = {};

    if (!menuData.name || menuData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    }

    if (!menuData.category) {
      errors.category = "Category is required";
    }

    if (!menuData.price || menuData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (menuData.cost && menuData.cost < 0) {
      errors.cost = "Cost cannot be negative";
    }

    if (menuData.preparationTime && menuData.preparationTime < 0) {
      errors.preparationTime = "Preparation time cannot be negative";
    }

    if (menuData.calories && menuData.calories < 0) {
      errors.calories = "Calories cannot be negative";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Format menu item for display
  formatMenuItemForDisplay(menuItem) {
    return {
      ...menuItem,
      formattedPrice: this.formatCurrency(menuItem.price),
      formattedCost: menuItem.cost ? this.formatCurrency(menuItem.cost) : null,
      profitMargin: this.calculateProfitMargin(menuItem.price, menuItem.cost),
      categoryDisplay: this.formatCategory(menuData.category),
      statusDisplay: menuItem.isAvailable ? "Available" : "Unavailable",
      featuredDisplay: menuItem.isFeatured ? "Featured" : "Regular",
    };
  }

  // Calculate profit margin
  calculateProfitMargin(price, cost) {
    if (!cost || !price) return null;
    return (((price - cost) / price) * 100).toFixed(2);
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

  // Format category for display
  formatCategory(category) {
    const categoryMap = {
      appetizer: "Appetizer",
      main_course: "Main Course",
      dessert: "Dessert",
      beverage: "Beverage",
      alcoholic: "Alcoholic",
      non_alcoholic: "Non-Alcoholic",
      special: "Special",
      side_dish: "Side Dish",
    };
    return categoryMap[category] || category;
  }

  // Get category options
  getCategoryOptions() {
    return [
      { value: "appetizer", label: "Appetizer" },
      { value: "main_course", label: "Main Course" },
      { value: "dessert", label: "Dessert" },
      { value: "beverage", label: "Beverage" },
      { value: "alcoholic", label: "Alcoholic" },
      { value: "non_alcoholic", label: "Non-Alcoholic" },
      { value: "special", label: "Special" },
      { value: "side_dish", label: "Side Dish" },
    ];
  }

  // Get dietary tag options
  getDietaryTagOptions() {
    return [
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "gluten_free", label: "Gluten Free" },
      { value: "dairy_free", label: "Dairy Free" },
      { value: "nut_free", label: "Nut Free" },
      { value: "spicy", label: "Spicy" },
      { value: "mild", label: "Mild" },
      { value: "healthy", label: "Healthy" },
    ];
  }

  // Get allergen options
  getAllergenOptions() {
    return [
      { value: "gluten", label: "Gluten" },
      { value: "dairy", label: "Dairy" },
      { value: "nuts", label: "Nuts" },
      { value: "eggs", label: "Eggs" },
      { value: "soy", label: "Soy" },
      { value: "fish", label: "Fish" },
      { value: "shellfish", label: "Shellfish" },
      { value: "sesame", label: "Sesame" },
    ];
  }
}

// Create and export service instance
const menuService = new MenuService();
export default menuService;
