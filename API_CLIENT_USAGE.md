# 🔄 DRY API Client Usage Guide

## 📋 Overview
The new API client eliminates code duplication and provides a consistent interface for all API calls.

## 🏗️ Architecture

### Core API Client (`apiClient.js`)
```javascript
import api, { 
  createResourceAPI, 
  authAPI, 
  dashboardAPI, 
  usersAPI, 
  outletsAPI,
  ordersAPI,
  reservationsAPI,
  inventoryAPI,
  guestsAPI,
  ticketsAPI,
  eventsAPI 
} from '../client/src/services/apiClient';
```

## 🎯 Usage Examples

### 1. Authentication
```javascript
// Login
const loginData = await authAPI.login({ email, password, outletId });

// Get current user
const userData = await authAPI.getCurrentUser();

// Logout
await authAPI.logout();
```

### 2. CRUD Operations (Any Resource)
```javascript
// Orders example
const orders = await ordersAPI.getAll({ status: 'pending' });
const order = await ordersAPI.getById('order-id');
const newOrder = await ordersAPI.create({ items: [...], total: 100 });
const updatedOrder = await ordersAPI.update('order-id', { status: 'completed' });
await ordersAPI.delete('order-id');

// Bulk operations
await ordersAPI.bulkCreate([order1, order2, order3]);
await ordersAPI.bulkDelete(['id1', 'id2', 'id3']);

// Search
const searchResults = await ordersAPI.search('pizza');
const orderCount = await ordersAPI.count({ status: 'pending' });
```

### 3. Dashboard Data
```javascript
// Get dashboard stats
const stats = await dashboardAPI.getStats();

// Get recent activity
const activity = await dashboardAPI.getActivity();

// Get revenue data
const revenue = await dashboardAPI.getRevenue('month');
```

### 4. Custom Endpoints
```javascript
// Outlets with special methods
const publicOutlets = await outletsAPI.getPublic();
const outletStats = await outletsAPI.getStats('outlet-id');
```

## 🔧 Creating New Services

### Method 1: Use Resource API Factory
```javascript
// For standard CRUD operations
export const menuItemsAPI = createResourceAPI('menu-items');

// Usage
const menuItems = await menuItemsAPI.getAll();
const menuItem = await menuItemsAPI.create({ name: 'Pizza', price: 25000 });
```

### Method 2: Custom Service
```javascript
// For complex operations
export const reportsAPI = {
  getSalesReport: (period) => api.get('/reports/sales', { period }),
  getInventoryReport: () => api.get('/reports/inventory'),
  exportReport: (type, format) => api.get(`/reports/${type}/export`, { format }),
};
```

## 📊 Real Examples

### Order Management Service
```javascript
import { ordersAPI } from './apiClient';

const orderService = {
  // Get today's orders
  getTodayOrders: () => ordersAPI.getAll({ 
    date: new Date().toISOString().split('T')[0] 
  }),

  // Create order with items
  createOrder: async (orderData) => {
    const response = await ordersAPI.create(orderData);
    return response.data;
  },

  // Update order status
  updateStatus: (orderId, status) => ordersAPI.patch(orderId, { status }),

  // Get order analytics
  getAnalytics: (period) => api.get('/orders/analytics', { period }),
};
```

### Reservation Service
```javascript
import { reservationsAPI } from './apiClient';

const reservationService = {
  // Get available tables
  getAvailableTables: (date, time, partySize) => 
    api.get('/reservations/available-tables', { date, time, partySize }),

  // Create reservation
  createReservation: (data) => reservationsAPI.create(data),

  // Check in guest
  checkIn: (reservationId) => reservationsAPI.patch(reservationId, { 
    status: 'seated',
    seatedAt: new Date().toISOString()
  }),
};
```

### Inventory Service
```javascript
import { inventoryAPI } from './apiClient';

const inventoryService = {
  // Get low stock items
  getLowStock: () => inventoryAPI.getAll({ lowStock: true }),

  // Update stock levels
  updateStock: (itemId, quantity, type = 'adjustment') => 
    api.post(`/inventory/${itemId}/stock`, { quantity, type }),

  // Get stock movements
  getMovements: (itemId, period) => 
    api.get(`/inventory/${itemId}/movements`, { period }),
};
```

## 🎨 React Hook Integration

### Custom Hook for API Calls
```javascript
import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/apiClient';

export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getAll(filters);
        setOrders(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [JSON.stringify(filters)]);

  return { orders, loading, error, refetch: fetchOrders };
};
```

### Usage in Components
```javascript
import { useOrders } from '../hooks/useOrders';

const OrdersList = () => {
  const { orders, loading, error } = useOrders({ status: 'pending' });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};
```

## 🔄 Migration from Old API

### Before (Repetitive)
```javascript
// authService.js
const response = await api.post('/auth/login', credentials);
return response.data;

// outletService.js  
const response = await api.get('/outlets/public');
return response.data;

// dashboardService.js
const response = await api.get('/dashboard/stats');
return response.data;
```

### After (DRY)
```javascript
// All services use the same pattern
const response = await authAPI.login(credentials);
const response = await outletsAPI.getPublic();
const response = await dashboardAPI.getStats();
```

## 🚀 Benefits

### 1. **Consistency**
- Same interface for all API calls
- Standardized error handling
- Consistent response format

### 2. **Maintainability**
- Single place to update API logic
- Easy to add new endpoints
- Centralized authentication handling

### 3. **Developer Experience**
- Auto-completion in IDEs
- Clear method names
- Reduced boilerplate code

### 4. **Scalability**
- Easy to add new resources
- Bulk operations built-in
- Search functionality included

## 🔧 Advanced Features

### Error Handling
```javascript
try {
  const orders = await ordersAPI.getAll();
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication error
  } else if (error.response?.status === 403) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

### Request Interceptors
```javascript
// Automatically adds auth token to all requests
// Handles token refresh
// Logs requests in development
```

### Response Interceptors
```javascript
// Handles 401 errors (auto-logout)
// Transforms response data
// Logs responses in development
```

## 📈 Next Steps

1. **Migrate all existing services** to use the new API client
2. **Create resource-specific services** for complex operations
3. **Add custom hooks** for common API patterns
4. **Implement caching** for frequently accessed data
5. **Add offline support** for critical operations

---

**🎉 The new API client makes our code more maintainable, consistent, and developer-friendly!**
