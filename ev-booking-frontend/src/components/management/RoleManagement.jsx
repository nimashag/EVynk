import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useState as useLocalState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoleManagement = () => {
    const { user } = useAuth();
    const currentRole = user?.role; // 'Backoffice' or 'StationOperator'
    const isBackoffice = currentRole === 'Backoffice';

    const [email, setEmail] = useLocalState('');
    const [password, setPassword] = useLocalState('');
    const [message, setMessage] = useLocalState('');
    const [operators, setOperators] = useLocalState([]);
    const [loading, setLoading] = useLocalState(false);
    const [selectedRoleNum, setSelectedRoleNum] = useLocalState(2); // 1=Backoffice, 2=StationOperator
  
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
        setMessage('User created successfully');
        setEmail('');
        setPassword('');
        if (isBackoffice) loadOperators();
      } else {
        setMessage(res.error || 'Failed to create user (email may already exist)');
      }
      setLoading(false);
    };
  
    return (
      <div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="User email" className="border border-gray-300 rounded px-3 py-2 text-sm" required />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Temp password" className="border border-gray-300 rounded px-3 py-2 text-sm" required />
          {isBackoffice && (
            <select value={selectedRoleNum} onChange={e => setSelectedRoleNum(Number(e.target.value))} className="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value={1}>Admin (Backoffice)</option>
              <option value={2}>Station Operator</option>
            </select>
          )}
          <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm disabled:opacity-50">{loading ? 'Creating...' : 'Create User'}</button>
        </form>
        {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}

        {isBackoffice && (
          <>
            <h4 className="font-medium text-gray-900 mb-2">Current Operators</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operators.map(op => (
                    <tr key={op.id}>
                      <td className="px-4 py-2 text-sm text-gray-800">{op.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{op.id}</td>
                    </tr>
                  ))}
                  {operators.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-center text-gray-500 text-sm">No operators yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  export default RoleManagement;