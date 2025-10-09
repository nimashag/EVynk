import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, Search, Filter, X, CheckCircle, XCircle, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { authService } from '../../services/authService';
import Navigation from '../common/Navigation';

const EVOwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    nic: '',
    fullName: '',
    email: '',
    phone: '',
    isActive: true
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, nic: null });

  useEffect(() => {
    fetchOwners();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const result = await authService.getEVOwners();
      if (result.success) {
        // Sort by newest first (assuming there's a createdAt or id field)
        const sortedOwners = [...result.data].reverse();
        setOwners(sortedOwners);
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch (err) {
      setError('Failed to load EV owners');
      showToast('Failed to load EV owners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let result;
      if (editingOwner) {
        result = await authService.updateEVOwner(editingOwner.id, formData);
      } else {
        result = await authService.createEVOwner(formData);
      }
      
      if (result.success) {
        showToast(editingOwner ? 'EV Owner updated successfully!' : 'New EV Owner added successfully!', 'success');
        resetForm();
        fetchOwners();
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch (err) {
      setError('Failed to save EV owner');
      showToast('Failed to save EV owner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setFormData({
      nic: owner.nic,
      fullName: owner.fullName,
      email: owner.email,
      phone: owner.phone,
      isActive: owner.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (nic) => {
    setDeleteConfirm({ show: true, nic });
  };

  const confirmDelete = async () => {
    const nic = deleteConfirm.nic;
    setDeleteConfirm({ show: false, nic: null });
    
    try {
      setLoading(true);
      const result = await authService.deleteEVOwner(nic);
      if (result.success) {
        showToast('EV Owner deleted successfully', 'success');
        fetchOwners();
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch (err) {
      setError('Failed to delete EV owner');
      showToast('Failed to delete EV owner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (nic, currentStatus) => {
    try {
      setLoading(true);
      const result = await authService.toggleEVOwnerStatus(nic, !currentStatus);
      if (result.success) {
        showToast(`EV Owner ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchOwners();
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch (err) {
      setError('Failed to update EV owner status');
      showToast('Failed to update EV owner status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nic: '',
      fullName: '',
      email: '',
      phone: '',
      isActive: true
    });
    setEditingOwner(null);
    setShowModal(false);
  };

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.nic.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && owner.isActive) ||
                         (filterStatus === 'inactive' && !owner.isActive);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: owners.length,
    active: owners.filter(o => o.isActive).length,
    inactive: owners.filter(o => !o.isActive).length
  };

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
                  <User size={22} className="text-lime-400" />
                </div>
                EV Owner Management
              </h1>
              <p className="text-teal-100 mt-2 text-sm">Manage and monitor all registered EV owners</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-lime-500 hover:bg-lime-400 text-teal-900 font-semibold px-6 py-3 rounded-lg transition shadow-lg shadow-lime-500/30 flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Owner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">Total Owners</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <User size={24} className="text-lime-400" />
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
                placeholder="Search by name, email, or NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
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
          <div className="grid gap-6">
            {filteredOwners.map((owner) => (
              <div
                key={owner.nic}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-bold text-white">
                            {owner.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                          owner.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{owner.fullName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                owner.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {owner.isActive ? '● Active' : '● Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CreditCard size={16} className="text-teal-600" />
                            <span className="font-medium">NIC:</span>
                            <span>{owner.nic}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={16} className="text-teal-600" />
                            <span className="truncate">{owner.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={16} className="text-teal-600" />
                            <span>{owner.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:items-end justify-end">
                      <button
                        onClick={() => handleToggleStatus(owner.nic, owner.isActive)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                          owner.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {owner.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                        <span className="hidden sm:inline">{owner.isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(owner.nic)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 size={18} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredOwners.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No owners found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
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
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-6 py-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                        <User size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {editingOwner ? 'Edit EV Owner' : 'Add New EV Owner'}
                        </h3>
                        <p className="text-xs text-teal-200">
                          {editingOwner ? 'Update owner information' : 'Register a new owner'}
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

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIC Number *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.nic}
                        onChange={(e) => setFormData({...formData, nic: e.target.value})}
                        disabled={!!editingOwner}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Enter NIC number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 text-lime-500 border-gray-300 rounded focus:ring-lime-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Set as active owner
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
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-teal-900 bg-lime-500 hover:bg-lime-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/30"
                    >
                      {loading ? 'Saving...' : (editingOwner ? 'Update Owner' : 'Add Owner')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {deleteConfirm.show && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setDeleteConfirm({ show: false, nic: null })}
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
                        Delete EV Owner
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
                      Are you sure you want to delete this EV owner? All associated data will be permanently removed from the system.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm({ show: false, nic: null })}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete Owner
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

export default EVOwnerManagement;