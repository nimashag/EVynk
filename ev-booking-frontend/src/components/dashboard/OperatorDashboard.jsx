import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Navigation from '../common/Navigation';
import StationsMap from '../common/StationsMap'; // 👈 import map component

const OperatorDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [panelData, setPanelData] = useState(null);
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      fetchPanelData();
    }
  }, [user, authLoading]);

  const fetchPanelData = async () => {
    try {
      const [panelRes, stationRes, bookingsRes] = await Promise.all([
        authService.getOperatorPanel(),
        authService.getOperatorStations(),
        authService.getOperatorBookings(),
      ]);

      if (panelRes.success) setPanelData(panelRes.data);
      if (stationRes.success) setStations(stationRes.data);
      if (bookingsRes.success) {
        const normalized = (bookingsRes.data || []).map((b) => ({
          ...b,
          statusText: (() => {
            const v = b.Status ?? b.status;
            if (typeof v === 'string') return v;
            // numeric enum mapping from backend: Pending=1, Active=2, Completed=3, Cancelled=4
            const map = { 1: 'Pending', 2: 'Active', 3: 'Completed', 4: 'Cancelled' };
            return map[v] || 'Pending';
          })(),
        }));
        setBookings(normalized);
      }

      if (!panelRes.success || !stationRes.success || !bookingsRes.success) {
        setError(panelRes.error || stationRes.error || bookingsRes.error);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (statusFilter !== 'ALL') {
      list = list.filter(b => (b.statusText) === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => {
        const stationName = (b.station?.location || '').toLowerCase();
        const nic = (b.ownerNic || b.OwnerNic || '').toLowerCase();
        return stationName.includes(q) || nic.includes(q);
      });
    }
    return list;
  }, [bookings, statusFilter, search]);

  const totalSlots = useMemo(() => stations.reduce((sum, s) => sum + (s.availableSlots ?? s.AvailableSlots ?? 0), 0), [stations]);
  const activeStations = useMemo(() => stations.filter(s => s.isActive).length, [stations]);

  const formatDateTime = (value) => {
    if (!value) return '-';
    try {
      const d = new Date(value.ReservationAtUtc || value.reservationAtUtc || value);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString();
    } catch {
      return '-';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Header with Profile and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-1">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                    {(user?.email || 'OP')[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Station Operator</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                {panelData?.message && (
                  <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded">
                    {panelData.message}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">🧩</span>
                  </div>
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500">Total Slots</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalSlots}</dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📅</span>
                  </div>
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500">Upcoming Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">{bookings.length}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Stations + Map */}
          {stations && stations.length > 0 && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Station Details</h3>
              <div className="mt-6">
                <StationsMap stations={stations.map(s => ({ ...s, lat: s.lat ?? s.Lat, lng: s.lng ?? s.Lng }))} height="360px" />
              </div>
            </div>
          )}

          {/* Bookings Table */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
              <h3 className="text-lg font-medium text-gray-900">Bookings</h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by station or owner NIC..."
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner NIC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No bookings found</td>
                    </tr>
                  )}

                  {filteredBookings.map((b, idx) => (
                    <tr key={b.id || b._id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(b.ReservationAtUtc || b.reservationAtUtc || b.ReservationAt || b.reservationAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.station?.location || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.OwnerNic || b.ownerNic || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (b.statusText) === 'Completed' ? 'bg-green-100 text-green-800' :
                          (b.statusText) === 'Active' ? 'bg-blue-100 text-blue-800' :
                          (b.statusText) === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {b.statusText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperatorDashboard;
