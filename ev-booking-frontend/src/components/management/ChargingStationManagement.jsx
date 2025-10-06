import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import Navigation from '../common/Navigation';
import LocationPicker from '../common/LocationPicker';

const ChargingStationManagement = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    lat: null,
    lng: null,
    address: '',
    type: 'AC',
    availableSlots: 1,
    isActive: true,
    operatorIds: [] // ✅ ensure this exists always
  });

  // ---------- Load Data ----------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadingOperators(true);

      const [stationsRes, opsRes] = await Promise.all([
        authService.getChargingStations(),
        authService.getAllOperators()
      ]);

      if (stationsRes.success) setStations(stationsRes.data);
      else setError(stationsRes.error);

      if (opsRes.success) setOperators(opsRes.data);
      else setError(opsRes.error);

      setLoading(false);
      setLoadingOperators(false);
    };

    loadData();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const result = await authService.getChargingStations();
      if (result.success) {
        setStations(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Failed to load charging stations');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = { ...formData };

      let result;
      if (editingStation) {
        result = await authService.updateChargingStation(editingStation.id, payload);
      } else {
        result = await authService.createChargingStation(payload);
      }

      if (result.success) {
        setShowModal(false);
        setEditingStation(null);
        resetForm();
        fetchStations();
      } else {
        setError(result.error);
      }
    } catch {
      setError('Failed to save charging station');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Edit ----------
  const handleEdit = (station) => {
    setEditingStation(station);
    setFormData({
      name: station.location,
      lat: station.lat,
      lng: station.lng,
      address: station.address,
      type: station.type === 2 ? 'DC' : 'AC',
      availableSlots: station.availableSlots,
      isActive: station.isActive,
      operatorIds: station.operatorIds || [] // ✅ keep previously assigned operators
    });
    setShowModal(true);
  };

  // ---------- Delete ----------
  const handleDelete = async (station) => {
    if (window.confirm('Are you sure you want to permanently delete this charging station?')) {
      try {
        setLoading(true);
        const result = await authService.deleteChargingStation(station.id || station.Id);

        if (result.success) fetchStations();
        else setError(result.error);
      } catch (err) {
        if (err.message?.includes('active bookings')) {
          setError('Cannot delete station with active bookings. Deactivate it first.');
        } else {
          setError('Failed to delete charging station');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // ---------- Toggle Active ----------
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const result = await authService.toggleChargingStationStatus(id, !currentStatus);
      if (result.success) fetchStations();
      else setError(result.error);
    } catch {
      setError('Failed to update charging station status');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Reset ----------
  const resetForm = () => {
    setFormData({
      name: '',
      lat: null,
      lng: null,
      address: '',
      type: 'AC',
      availableSlots: 1,
      isActive: true,
      operatorIds: [] // ✅ reset this too
    });
    setEditingStation(null);
    setShowModal(false);
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      lat: locationData.lat,
      lng: locationData.lng,
      address: locationData.address
    }));
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Charging Station Management</h2>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Add New Station
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <div key={station.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{station.location}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${station.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {station.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {station.address && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span> {station.address}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {station.type === 2 ? 'DC' : 'AC'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Available Slots:</span> {station.availableSlots}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleStatus(station.id, station.isActive)}
                      className={`text-sm font-medium ${station.isActive
                          ? 'text-red-600 hover:text-red-500'
                          : 'text-green-600 hover:text-green-500'
                        }`}
                    >
                      {station.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(station)}
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(station)}
                      className="text-red-600 hover:text-red-500 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingStation ? 'Edit Charging Station' : 'Add New Charging Station'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Station name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Colombo Supercharge - Bambalapitiya"
                    />
                  </div>

                  {/* Location picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pick Location (Sri Lanka)
                    </label>
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={
                        formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null
                      }
                    />
                    {(formData.address || (formData.lat && formData.lng)) && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected: {formData.address || `${formData.lat?.toFixed(6)}, ${formData.lng?.toFixed(6)}`}
                      </div>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="AC">AC (Alternating Current)</option>
                      <option value="DC">DC (Direct Current)</option>
                    </select>
                  </div>

                  {/* Slots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Slots *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.availableSlots}
                      onChange={(e) =>
                        setFormData({ ...formData, availableSlots: parseInt(e.target.value) })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Operators selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign Operator(s)
                    </label>

                    {loadingOperators ? (
                      <p className="text-sm text-gray-500 italic">Loading operators...</p>
                    ) : operators.length > 0 ? (
                      <div className="border border-gray-300 rounded-md p-2 h-40 overflow-y-auto">
                        {operators.map((op) => {
                          // Check if this operator is already assigned to another station
                          const assignedStation = stations.find(
                            (s) => s.operatorIds?.includes(op.id) &&
                              (!editingStation || s.id !== editingStation.id)
                          );

                          const isSelected = formData.operatorIds?.includes(op.id);
                          const isDisabled = !!assignedStation; // disable if assigned elsewhere

                          return (
                            <div
                              key={op.id}
                              onClick={() => {
                                if (isDisabled) return; // prevent clicking disabled ones
                                const updated = isSelected
                                  ? formData.operatorIds.filter((id) => id !== op.id)
                                  : [...(formData.operatorIds || []), op.id];
                                setFormData((prev) => ({ ...prev, operatorIds: updated }));
                              }}
                              className={`flex justify-between items-center px-3 py-2 rounded-md mb-1 transition cursor-pointer ${isDisabled
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-green-100 text-green-800 border border-green-400'
                                    : 'bg-white hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                              <span>{op.email}</span>
                              {isDisabled && (
                                <span className="text-xs text-gray-500 italic">
                                  (Assigned to {assignedStation?.location || 'a station'})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No station operators found</p>
                    )}

                    {formData.operatorIds?.length > 0 && (
                      <p className="text-xs text-green-700 mt-2">
                        Selected: {formData.operatorIds.length} operator
                        {formData.operatorIds.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>


                  {/* Active checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>

                  {/* Buttons */}
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
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingStation ? 'Update' : 'Create'}
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

export default ChargingStationManagement;
