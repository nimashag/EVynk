import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import Navigation from '../common/Navigation';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    evOwnerId: '',
    chargingStationId: '',
    reservationDate: '',
    reservationTime: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsResult, stationsResult, ownersResult] = await Promise.all([
        authService.getBookings(),
        authService.getChargingStations(),
        authService.getEVOwners()
      ]);

      if (bookingsResult.success) setBookings(bookingsResult.data);
      if (stationsResult.success) setStations(stationsResult.data);
      if (ownersResult.success) setOwners(ownersResult.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate reservation date (within 7 days)
    const reservationDateTime = new Date(`${formData.reservationDate}T${formData.reservationTime}`);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    if (reservationDateTime < now) {
      setError('Reservation date cannot be in the past');
      return;
    }
    
    if (reservationDateTime > sevenDaysFromNow) {
      setError('Reservation date cannot be more than 7 days from now');
      return;
    }

    try {
      setLoading(true);
      let result;
      if (editingBooking) {
        result = await authService.updateBooking(editingBooking.id, formData);
      } else {
        result = await authService.createBooking(formData);
      }
      
      if (result.success) {
        setShowModal(false);
        setEditingBooking(null);
        resetForm();
        fetchData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    const reservationDate = new Date(booking.reservationAtUtc).toISOString().split('T')[0];
    const reservationTime = new Date(booking.reservationAtUtc).toTimeString().split(' ')[0].substring(0, 5);
    
    setFormData({
      evOwnerId: booking.ownerNic,
      chargingStationId: booking.stationId,
      reservationDate: reservationDate,
      reservationTime: reservationTime,
      status: booking.status
    });
    setShowModal(true);
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setLoading(true);
        const result = await authService.cancelBooking(id);
        if (result.success) {
          fetchData();
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to cancel booking');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      evOwnerId: '',
      chargingStationId: '',
      reservationDate: '',
      reservationTime: '',
      status: 'Pending'
    });
    setEditingBooking(null);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditOrCancel = (booking) => {
    const reservationDateTime = new Date(booking.reservationAtUtc);
    const now = new Date();
    const twelveHoursFromNow = new Date(now.getTime() + (12 * 60 * 60 * 1000));
    
    return reservationDateTime > twelveHoursFromNow && booking.status === 'Pending';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Create New Booking
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => {
              const owner = owners.find(o => o.nic === booking.ownerNic);
              const station = stations.find(s => s.id === booking.stationId);
              const canModify = canEditOrCancel(booking);
              
              // Convert UTC date to local date for display
              const reservationDate = new Date(booking.reservationAtUtc).toLocaleDateString();
              const reservationTime = new Date(booking.reservationAtUtc).toLocaleTimeString();
              
              return (
                <li key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {owner ? owner.fullName : 'Unknown Owner'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {station ? station.location : 'Unknown Station'} - {station ? station.type : ''}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reservationDate} at {reservationTime}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          {canModify && (
                            <>
                              <button
                                onClick={() => handleEdit(booking)}
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="text-red-600 hover:text-red-500 text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBooking ? 'Edit Booking' : 'Create New Booking'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    EV Owner *
                  </label>
                  <select
                    value={formData.evOwnerId}
                    onChange={(e) => setFormData({...formData, evOwnerId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select EV Owner</option>
                    {owners.filter(owner => owner.isActive).map(owner => (
                      <option key={owner.nic} value={owner.nic}>
                        {owner.fullName} ({owner.nic})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charging Station *
                  </label>
                  <select
                    value={formData.chargingStationId}
                    onChange={(e) => setFormData({...formData, chargingStationId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Charging Station</option>
                    {stations.filter(station => station.isActive && station.availableSlots > 0).map(station => (
                      <option key={station.id} value={station.id}>
                        {station.location} - {station.type} ({station.availableSlots} slots available)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reservation Date *
                    </label>
                    <input
                      type="date"
                      value={formData.reservationDate}
                      onChange={(e) => setFormData({...formData, reservationDate: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reservation Time *
                    </label>
                    <input
                      type="time"
                      value={formData.reservationTime}
                      onChange={(e) => setFormData({...formData, reservationTime: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingBooking ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default BookingManagement;
