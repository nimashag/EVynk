import React, { useState, useEffect } from 'react';
import { MapPin, Zap, Search, Filter, X, CheckCircle, XCircle, Plus, Trash2, Power, PowerOff, Navigation as NavIcon, Layers } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, station: null });

  const [formData, setFormData] = useState({
    name: '',
    lat: null,
    lng: null,
    address: '',
    type: 'AC',
    availableSlots: 1,
    isActive: true,
    operatorIds: []
  });

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

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const fetchStations = async () => {
    try {
      setLoading(true);
      const result = await authService.getChargingStations();
      if (result.success) {
        setStations(result.data);
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch {
      setError('Failed to load charging stations');
      showToast('Failed to load charging stations', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        showToast(editingStation ? 'Station updated successfully!' : 'New station added successfully!', 'success');
        resetForm();
        fetchStations();
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch {
      setError('Failed to save charging station');
      showToast('Failed to save charging station', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      operatorIds: station.operatorIds || []
    });
    setShowModal(true);
  };

  const handleDelete = async (station) => {
    setDeleteConfirm({ show: true, station });
  };

  const confirmDelete = async () => {
    const station = deleteConfirm.station;
    setDeleteConfirm({ show: false, station: null });

    try {
      setLoading(true);
      const result = await authService.deleteChargingStation(station.id || station.Id);

      if (result.success) {
        showToast('Station deleted successfully', 'success');
        fetchStations();
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch (err) {
      if (err.message?.includes('active bookings')) {
        showToast('Cannot delete station with active bookings. Deactivate it first.', 'error');
      } else {
        showToast('Failed to delete charging station', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const result = await authService.toggleChargingStationStatus(id, !currentStatus);
      if (result.success) {
        showToast(`Station ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchStations();
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch {
      setError('Failed to update charging station status');
      showToast('Failed to update charging station status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      lat: null,
      lng: null,
      address: '',
      type: 'AC',
      availableSlots: 1,
      isActive: true,
      operatorIds: []
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

  const filteredStations = [...stations].reverse().filter(station => {
    const matchesSearch = station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'AC' && station.type !== 2) ||
                         (filterType === 'DC' && station.type === 2);
    return matchesSearch && matchesFilter;
  });

  const activeStations = filteredStations.filter(s => s.isActive);
  const inactiveStations = filteredStations.filter(s => !s.isActive);

  const stats = {
    total: stations.length,
    active: stations.filter(s => s.isActive).length,
    inactive: stations.filter(s => !s.isActive).length,
    ac: stations.filter(s => s.type !== 2).length,
    dc: stations.filter(s => s.type === 2).length
  };

  const StationCard = ({ station }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
                station.type === 2 
                  ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-700'
              }`}>
                <Zap size={28} className="text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                station.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{station.location}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      station.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {station.isActive ? '● Active' : '● Inactive'}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      station.type === 2
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {station.type === 2 ? 'DC Fast' : 'AC Standard'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                {station.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{station.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Layers size={16} className="text-teal-600" />
                  <span className="font-medium">Available Slots:</span>
                  <span className="font-bold text-teal-700">{station.availableSlots}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => handleEdit(station)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            >
              <NavIcon size={18} />
              <span>Edit</span>
            </button>
            
            <button
              onClick={() => handleToggleStatus(station.id, station.isActive)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                station.isActive
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {station.isActive ? <PowerOff size={18} /> : <Power size={18} />}
              <span>{station.isActive ? 'Deactivate' : 'Activate'}</span>
            </button>
            
            <button
              onClick={() => handleDelete(station)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />
      
      {toast.show && (
        <div className="fixed top-6 right-6 z-50" style={{ animation: 'slideIn 0.3s ease-out' }}>
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-lime-500 to-lime-600 border-lime-400 text-white' 
              : 'bg-gradient-to-r from-red-500 to-red-600 border-red-400 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={22} /> : <XCircle size={22} />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-teal-900 to-teal-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                  <Zap size={22} className="text-lime-400" />
                </div>
                Charging Station Management
              </h1>
              <p className="text-teal-100 mt-2 text-sm">Manage and monitor all charging stations</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-lime-500 hover:bg-lime-400 text-teal-900 font-semibold px-6 py-3 rounded-lg transition shadow-lg shadow-lime-500/30 flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Station
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">Total Stations</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <Zap size={24} className="text-lime-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.active}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Power size={24} className="text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">Inactive</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.inactive}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <PowerOff size={24} className="text-red-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">AC Stations</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.ac}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Zap size={24} className="text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">DC Stations</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.dc}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap size={24} className="text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                <option value="AC">AC Only</option>
                <option value="DC">DC Only</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-lime-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 mb-4 shadow-lg">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Power size={24} />
                  Active Stations ({activeStations.length})
                </h2>
              </div>
              <div className="space-y-4">
                {activeStations.length > 0 ? (
                  activeStations.map((station) => (
                    <StationCard key={station.id} station={station} />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active stations</h3>
                    <p className="text-gray-600">All stations are currently inactive</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 mb-4 shadow-lg">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PowerOff size={24} />
                  Inactive Stations ({inactiveStations.length})
                </h2>
              </div>
              <div className="space-y-4">
                {inactiveStations.length > 0 ? (
                  inactiveStations.map((station) => (
                    <StationCard key={station.id} station={station} />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No inactive stations</h3>
                    <p className="text-gray-600">All stations are currently active</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={resetForm}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-6 py-5 rounded-t-2xl sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                        <Zap size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {editingStation ? 'Edit Charging Station' : 'Add New Charging Station'}
                        </h3>
                        <p className="text-xs text-teal-200">
                          {editingStation ? 'Update station information' : 'Register a new station'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetForm}
                      className="text-white/70 hover:text-white transition"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Station Name *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                        placeholder="e.g., Colombo Supercharge - Bambalapitiya"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pick Location (Sri Lanka)
                    </label>
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={
                        formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null
                      }
                    />
                    {(formData.address || (formData.lat && formData.lng)) && (
                      <div className="mt-2 p-3 bg-lime-50 border border-lime-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Selected:</span> {formData.address || `${formData.lat?.toFixed(6)}, ${formData.lng?.toFixed(6)}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    >
                      <option value="AC">AC (Alternating Current)</option>
                      <option value="DC">DC (Direct Current - Fast Charging)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Available Slots *
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        min="0"
                        value={formData.availableSlots}
                        onChange={(e) =>
                          setFormData({ ...formData, availableSlots: parseInt(e.target.value) })
                        }
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign Operator(s)
                    </label>

                    {loadingOperators ? (
                      <p className="text-sm text-gray-500 italic">Loading operators...</p>
                    ) : operators.length > 0 ? (
                      <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto bg-gray-50">
                        {operators.map((op) => {
                          const assignedStation = stations.find(
                            (s) => s.operatorIds?.includes(op.id) &&
                              (!editingStation || s.id !== editingStation.id)
                          );

                          const isSelected = formData.operatorIds?.includes(op.id);
                          const isDisabled = !!assignedStation;

                          return (
                            <div
                              key={op.id}
                              onClick={() => {
                                if (isDisabled) return;
                                const updated = isSelected
                                  ? formData.operatorIds.filter((id) => id !== op.id)
                                  : [...(formData.operatorIds || []), op.id];
                                setFormData((prev) => ({ ...prev, operatorIds: updated }));
                              }}
                              className={`flex justify-between items-center px-3 py-2 rounded-lg mb-1 transition cursor-pointer ${
                                isDisabled
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-lime-100 text-lime-900 border-2 border-lime-400'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              <span className="font-medium">{op.email}</span>
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
                      <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200">
                        No station operators found
                      </p>
                    )}

                    {formData.operatorIds?.length > 0 && (
                      <p className="text-xs text-lime-700 mt-2 font-medium">
                        Selected: {formData.operatorIds.length} operator{formData.operatorIds.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-lime-500 border-gray-300 rounded focus:ring-lime-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Set as active station
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-teal-900 bg-lime-500 hover:bg-lime-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/30"
                    >
                      {loading ? 'Saving...' : (editingStation ? 'Update Station' : 'Add Station')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {deleteConfirm.show && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setDeleteConfirm({ show: false, station: null })}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <XCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Delete Charging Station
                      </h3>
                      <p className="text-xs text-red-100">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-gray-700 text-base">
                      Are you sure you want to delete <span className="font-bold">{deleteConfirm.station?.location}</span>? All associated data will be permanently removed from the system.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm({ show: false, station: null })}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete Station
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChargingStationManagement;