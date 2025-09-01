import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { api } from '../services/apiService';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    guestId: '',
    reservationDate: '',
    reservationTime: '',
    partySize: 1,
    specialRequests: ''
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      setShowForm(false);
      setFormData({ guestId: '', reservationDate: '', reservationTime: '', partySize: 1, specialRequests: '' });
      fetchReservations();
    } catch (error) {
      console.error('Failed to create reservation:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/reservations/${id}`, { status });
      fetchReservations();
    } catch (error) {
      console.error('Failed to update reservation:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Reservation
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">New Reservation</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="date"
                  value={formData.reservationDate}
                  onChange={(e) => setFormData({...formData, reservationDate: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="time"
                  value={formData.reservationTime}
                  onChange={(e) => setFormData({...formData, reservationTime: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Party Size"
                  value={formData.partySize}
                  onChange={(e) => setFormData({...formData, partySize: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="1"
                  required
                />
                <textarea
                  placeholder="Special Requests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Create
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
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reservations..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Party Size</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t">
                  <td className="px-4 py-3">{reservation.reservationDate}</td>
                  <td className="px-4 py-3">{reservation.reservationTime}</td>
                  <td className="px-4 py-3">{reservation.partySize}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={reservation.status}
                      onChange={(e) => updateStatus(reservation.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="seated">Seated</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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

export default Reservations;
