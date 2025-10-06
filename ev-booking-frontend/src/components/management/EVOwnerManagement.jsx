import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import Navigation from '../common/Navigation';

const EVOwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [formData, setFormData] = useState({
    nic: '',
    fullName: '',
    email: '',
    phone: '',
    isActive: true
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const result = await authService.getEVOwners();
      if (result.success) {
        setOwners(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load EV owners');
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
        setShowModal(false);
        setEditingOwner(null);
        setFormData({
          nic: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          isActive: true
        });
        fetchOwners();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to save EV owner');
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
    if (window.confirm('Are you sure you want to delete this EV owner?')) {
      try {
        setLoading(true);
        const result = await authService.deleteEVOwner(nic);
        if (result.success) {
          fetchOwners();
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to delete EV owner');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (nic, currentStatus) => {
    try {
      setLoading(true);
      const result = await authService.toggleEVOwnerStatus(nic, !currentStatus);
      if (result.success) {
        fetchOwners();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update EV owner status');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">EV Owner Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Add New EV Owner
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {owners.map((owner) => (
              <li key={owner.nic} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {owner.fullName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {owner.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        NIC: {owner.nic} | Email: {owner.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phone: {owner.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      owner.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {owner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(owner.nic, owner.isActive)}
                      className={`text-sm font-medium ${
                        owner.isActive 
                          ? 'text-red-600 hover:text-red-500' 
                          : 'text-green-600 hover:text-green-500'
                      }`}
                    >
                      {owner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(owner)}
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(owner.nic)}
                      className="text-red-600 hover:text-red-500 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingOwner ? 'Edit EV Owner' : 'Add New EV Owner'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIC *
                  </label>
                  <input
                    type="text"
                    value={formData.nic}
                    onChange={(e) => setFormData({...formData, nic: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter NIC number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
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
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingOwner ? 'Update' : 'Create')}
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

export default EVOwnerManagement;
