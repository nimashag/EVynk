import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Users, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const RoleManagement = () => {
    const { user } = useAuth();
    const currentRole = user?.role; // 'Backoffice' or 'StationOperator'
    const isBackoffice = currentRole === 'Backoffice';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoleNum, setSelectedRoleNum] = useState(2); // 1=Backoffice, 2=StationOperator (default)
  
    const loadOperators = async () => {
      if (!isBackoffice) return; // operators list is admin-only (backend protected)
      const res = await authService.listOperators();
      if (res.success) setOperators(res.data);
    };
  
    useEffect(() => {
      loadOperators();
    }, []);
  
    const handleCreate = async (e) => {
      e.preventDefault();
      setMessage('');
      setLoading(true);

      const token = localStorage.getItem('authToken');
  console.log('🔍 Current token:', token);

  if (!token) {
    setMessage('⚠️ No token found — please login as Backoffice first.');
    setLoading(false);
    return;
  }

      let res;
      if (isBackoffice) {
        // Admin can create either Backoffice (1) or StationOperator (2)
        const roleName = Number(selectedRoleNum) === 1 ? 'Backoffice' : 'StationOperator';
        res = await authService.register(email, password, roleName);
      } else {
        // Station Operator self-creates operators via open endpoint
        res = await authService.registerOperator(email, password);
      }

      if (res.success) {
        toast.success('User created successfully!', { toastId: 'user-created' });
        setMessage('');
        setEmail('');
        setPassword('');
        if (isBackoffice) loadOperators();
      } else {
        toast.error(res.error || 'Failed to create user (email may already exist)', { toastId: 'user-create-error' });
        setMessage('');
      }
      setLoading(false);
    };
  
    return (
      <div className="space-y-6">
        {/* Create User Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-lime-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                <UserPlus className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-teal-900">Create New User</h3>
                <p className="text-sm text-gray-600">Add a new station operator to the system</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    type="email" 
                    placeholder="operator@example.com" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Temporary Password
                  </label>
                  <input 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    type="password" 
                    placeholder="Enter temporary password" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200" 
                    required 
                  />
                </div>
                
                {isBackoffice && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select 
                      value={selectedRoleNum} 
                      onChange={e => setSelectedRoleNum(Number(e.target.value))} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500" 
                      disabled
                    >
                      <option value={1}>Admin (Backoffice)</option>
                      <option value={2}>Station Operator</option>
                    </select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 opacity-0">
                    Action
                  </label>
                  <button 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <UserPlus size={16} />
                        Create User
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </form>
            
          </div>
        </div>

        {/* Operators List */}
        {isBackoffice && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-lime-50 to-teal-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teal-900">Current Operators</h3>
                  <p className="text-sm text-gray-600">Manage existing station operators</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-gray-400" />
                        Email Address
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operators.map((op, index) => (
                    <tr key={op.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                            {op.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{op.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">{op.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                  {operators.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="text-gray-400" size={24} />
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">No operators yet</p>
                            <p className="text-sm text-gray-400">Create your first station operator above</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default RoleManagement;