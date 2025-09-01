import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle } from 'lucide-react';
import { api } from '../services/apiService';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'food',
    currentStock: 0,
    reorderPoint: 0,
    unitCost: 0
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data.inventory || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', formData);
      setShowForm(false);
      setFormData({ itemName: '', category: 'food', currentStock: 0, reorderPoint: 0, unitCost: 0 });
      fetchInventory();
    } catch (error) {
      console.error('Failed to create inventory item:', error);
    }
  };

  const updateStock = async (id, quantity, type) => {
    try {
      await api.patch(`/inventory/${id}/stock`, { quantity, type });
      fetchInventory();
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Inventory Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="food">Food</option>
                  <option value="beverage">Beverage</option>
                  <option value="alcohol">Alcohol</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="equipment">Equipment</option>
                </select>
                <input
                  type="number"
                  placeholder="Current Stock"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({...formData, currentStock: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.1"
                />
                <input
                  type="number"
                  placeholder="Reorder Point"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({...formData, reorderPoint: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.1"
                />
                <input
                  type="number"
                  placeholder="Unit Cost (UGX)"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({...formData, unitCost: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Reorder Point</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{item.itemName}</td>
                  <td className="px-4 py-3 capitalize">{item.category}</td>
                  <td className="px-4 py-3">{item.currentStock}</td>
                  <td className="px-4 py-3">{item.reorderPoint}</td>
                  <td className="px-4 py-3">
                    {item.currentStock <= item.reorderPoint ? (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600">In Stock</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const qty = prompt('Add quantity:');
                          if (qty) updateStock(item.id, parseFloat(qty), 'add');
                        }}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          const qty = prompt('Subtract quantity:');
                          if (qty) updateStock(item.id, parseFloat(qty), 'subtract');
                        }}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
