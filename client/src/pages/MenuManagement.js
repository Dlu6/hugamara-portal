import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Utensils,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
  Package,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchMenuItems,
  fetchMenuStats,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  toggleFeatured,
  setShowForm,
  setEditingMenuItem,
  setViewingMenuItem,
  setFilters,
  resetFormData,
  setFormData,
  setFormErrors,
  clearFormErrors,
} from "../store/slices/menuSlice";
import {
  selectMenuItems,
  selectFilteredMenuItems,
  selectMenuStats,
  selectMenuLoading,
  selectMenuFormData,
  selectMenuFormErrors,
  selectShowMenuForm,
  selectEditingMenuItem,
  selectViewingMenuItem,
} from "../store/slices/menuSlice";

const MenuManagement = () => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();

  // Redux state
  const menuItems = useSelector(selectMenuItems);
  const filteredMenuItems = useSelector(selectFilteredMenuItems);
  const stats = useSelector(selectMenuStats);
  const loading = useSelector(selectMenuLoading);
  const formData = useSelector(selectMenuFormData);
  const formErrors = useSelector(selectMenuFormErrors);
  const showForm = useSelector(selectShowMenuForm);
  const editingMenuItem = useSelector(selectEditingMenuItem);
  const viewingMenuItem = useSelector(selectViewingMenuItem);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchMenuStats());
  }, [dispatch]);

  // Apply filters
  useEffect(() => {
    let filtered = [...menuItems];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (availabilityFilter) {
      filtered = filtered.filter((item) => {
        if (availabilityFilter === "available") return item.isAvailable;
        if (availabilityFilter === "unavailable") return !item.isAvailable;
        return true;
      });
    }

    if (featuredFilter) {
      filtered = filtered.filter((item) => {
        if (featuredFilter === "featured") return item.isFeatured;
        if (featuredFilter === "regular") return !item.isFeatured;
        return true;
      });
    }

    dispatch(
      setFilters({
        search: searchTerm,
        category: categoryFilter,
        availability: availabilityFilter,
        featured: featuredFilter,
      })
    );
  }, [
    searchTerm,
    categoryFilter,
    availabilityFilter,
    featuredFilter,
    menuItems,
    dispatch,
  ]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch(
      setFormData({
        [name]: type === "checkbox" ? checked : value,
      })
    );
    // Clear error for this field
    if (formErrors[name]) {
      dispatch(
        setFormErrors({
          ...formErrors,
          [name]: "",
        })
      );
    }
  };

  const handleArrayChange = (name, value) => {
    dispatch(
      setFormData({
        [name]: value,
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearFormErrors());

    try {
      if (editingMenuItem) {
        await dispatch(
          updateMenuItem({
            id: editingMenuItem.id,
            menuData: formData,
          })
        ).unwrap();
        showSuccess("Menu item updated successfully");
      } else {
        await dispatch(createMenuItem(formData)).unwrap();
        showSuccess("Menu item created successfully");
      }
      dispatch(setShowForm(false));
      dispatch(resetFormData());
      dispatch(setEditingMenuItem(null));
    } catch (error) {
      showError("Failed to save menu item", error);
    }
  };

  const handleEdit = (menuItem) => {
    dispatch(setEditingMenuItem(menuItem));
    dispatch(setFormData(menuItem));
    dispatch(setShowForm(true));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await dispatch(deleteMenuItem(id)).unwrap();
        showSuccess("Menu item deleted successfully");
      } catch (error) {
        showError("Failed to delete menu item", error);
      }
    }
  };

  const handleView = (menuItem) => {
    dispatch(setViewingMenuItem(menuItem));
  };

  const handleToggleAvailability = async (id) => {
    try {
      await dispatch(toggleAvailability(id)).unwrap();
      showSuccess("Availability updated successfully");
    } catch (error) {
      showError("Failed to update availability", error);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await dispatch(toggleFeatured(id)).unwrap();
      showSuccess("Featured status updated successfully");
    } catch (error) {
      showError("Failed to update featured status", error);
    }
  };

  const resetForm = () => {
    dispatch(resetFormData());
    dispatch(setShowForm(false));
    dispatch(setEditingMenuItem(null));
    dispatch(setViewingMenuItem(null));
    dispatch(clearFormErrors());
  };

  const openCreateForm = () => {
    resetForm();
    dispatch(setShowForm(true));
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCategory = (category) => {
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
  };

  const getStatusColor = (isAvailable) => {
    return isAvailable ? "text-green-400" : "text-red-400";
  };

  const getStatusIcon = (isAvailable) => {
    return isAvailable ? CheckCircle : XCircle;
  };

  const getCategoryOptions = () => [
    { value: "appetizer", label: "Appetizer" },
    { value: "main_course", label: "Main Course" },
    { value: "dessert", label: "Dessert" },
    { value: "beverage", label: "Beverage" },
    { value: "alcoholic", label: "Alcoholic" },
    { value: "non_alcoholic", label: "Non-Alcoholic" },
    { value: "special", label: "Special" },
    { value: "side_dish", label: "Side Dish" },
  ];

  const getDietaryTagOptions = () => [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten_free", label: "Gluten Free" },
    { value: "dairy_free", label: "Dairy Free" },
    { value: "nut_free", label: "Nut Free" },
    { value: "spicy", label: "Spicy" },
    { value: "mild", label: "Mild" },
    { value: "healthy", label: "Healthy" },
  ];

  const getAllergenOptions = () => [
    { value: "gluten", label: "Gluten" },
    { value: "dairy", label: "Dairy" },
    { value: "nuts", label: "Nuts" },
    { value: "eggs", label: "Eggs" },
    { value: "soy", label: "Soy" },
    { value: "fish", label: "Fish" },
    { value: "shellfish", label: "Shellfish" },
    { value: "sesame", label: "Sesame" },
  ];

  // Stats cards
  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <div className="bg-neutral-800 rounded-lg p-6 shadow-lg border border-neutral-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  if (loading && menuItems.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Utensils className="w-8 h-8 text-blue-400" />
            Menu Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your menu items and categories
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Items"
          value={stats.totalItems || 0}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Available"
          value={stats.availableItems || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Featured"
          value={stats.featuredItems || 0}
          icon={Star}
          color="yellow"
        />
        <StatCard
          title="Avg Price"
          value={formatCurrency(stats.avgPrice || 0)}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 rounded-lg p-6 mb-6 border border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {getCategoryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Availability
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Featured
            </label>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="featured">Featured</option>
              <option value="regular">Regular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {filteredMenuItems.map((item) => {
                const StatusIcon = getStatusIcon(item.isAvailable);
                return (
                  <tr key={item.id} className="hover:bg-neutral-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {item.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatCategory(item.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon
                          className={`w-4 h-4 mr-2 ${getStatusColor(
                            item.isAvailable
                          )}`}
                        />
                        <span
                          className={`text-sm ${getStatusColor(
                            item.isAvailable
                          )}`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(item.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isFeatured
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {item.isFeatured ? "Featured" : "Regular"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`${getStatusColor(
                            item.isAvailable
                          )} hover:opacity-75`}
                        >
                          <StatusIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">
              No menu items
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new menu item.
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingMenuItem ? "Edit Menu Item" : "Create Menu Item"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? "border-red-500" : "border-neutral-600"
                    }`}
                    placeholder="Enter menu item name"
                  />
                  {formErrors.name && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.category
                        ? "border-red-500"
                        : "border-neutral-600"
                    }`}
                  >
                    {getCategoryOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.price ? "border-red-500" : "border-neutral-600"
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Pasta, Pizza, Salad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter menu item description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dietary Tags
                  </label>
                  <div className="space-y-2">
                    {getDietaryTagOptions().map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            formData.dietaryTags?.includes(option.value) ||
                            false
                          }
                          onChange={(e) => {
                            const currentTags = formData.dietaryTags || [];
                            const newTags = e.target.checked
                              ? [...currentTags, option.value]
                              : currentTags.filter(
                                  (tag) => tag !== option.value
                                );
                            handleArrayChange("dietaryTags", newTags);
                          }}
                          className="mr-2 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Allergens
                  </label>
                  <div className="space-y-2">
                    {getAllergenOptions().map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            formData.allergens?.includes(option.value) || false
                          }
                          onChange={(e) => {
                            const currentAllergens = formData.allergens || [];
                            const newAllergens = e.target.checked
                              ? [...currentAllergens, option.value]
                              : currentAllergens.filter(
                                  (allergen) => allergen !== option.value
                                );
                            handleArrayChange("allergens", newAllergens);
                          }}
                          className="mr-2 text-red-600 bg-neutral-700 border-neutral-600 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="mr-2 text-green-600 bg-neutral-700 border-neutral-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">Available</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="mr-2 text-yellow-600 bg-neutral-700 border-neutral-600 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingMenuItem ? "Update" : "Create"} Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingMenuItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Menu Item Details
              </h2>
              <button
                onClick={() => dispatch(setViewingMenuItem(null))}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {viewingMenuItem.name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {viewingMenuItem.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">
                        {formatCategory(viewingMenuItem.category)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(viewingMenuItem.price)}
                      </span>
                    </div>
                    {viewingMenuItem.cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cost:</span>
                        <span className="text-white">
                          {formatCurrency(viewingMenuItem.cost)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span
                        className={`${getStatusColor(
                          viewingMenuItem.isAvailable
                        )}`}
                      >
                        {viewingMenuItem.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Featured:</span>
                      <span
                        className={
                          viewingMenuItem.isFeatured
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }
                      >
                        {viewingMenuItem.isFeatured ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  {viewingMenuItem.imageUrl && (
                    <img
                      src={viewingMenuItem.imageUrl}
                      alt={viewingMenuItem.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-2">
                    {viewingMenuItem.preparationTime && (
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{viewingMenuItem.preparationTime} minutes</span>
                      </div>
                    )}
                    {viewingMenuItem.calories && (
                      <div className="flex items-center text-gray-300">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span>{viewingMenuItem.calories} calories</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {viewingMenuItem.dietaryTags &&
                viewingMenuItem.dietaryTags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Dietary Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingMenuItem.dietaryTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {viewingMenuItem.allergens &&
                viewingMenuItem.allergens.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Allergens
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingMenuItem.allergens.map((allergen) => (
                        <span
                          key={allergen}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  onClick={() => dispatch(setViewingMenuItem(null))}
                  className="px-4 py-2 text-gray-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    dispatch(setViewingMenuItem(null));
                    handleEdit(viewingMenuItem);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
