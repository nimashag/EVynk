import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Navigation from '../common/Navigation';
import StationsMap from '../common/StationsMap'; // 👈 import map component
import { Zap, CheckCircle, Calendar, Search, Filter } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          <p className="text-teal-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Slots',
      value: totalSlots,
      icon: Zap,
      bgColor: 'bg-gradient-to-br from-teal-500 to-teal-600',
      lightBg: 'bg-teal-50',
      textColor: 'text-teal-700',
    },
    {
      title: 'Upcoming Bookings',
      value: bookings.length,
      icon: Calendar,
      bgColor: 'bg-gradient-to-br from-lime-500 to-lime-600',
      lightBg: 'bg-lime-50',
      textColor: 'text-lime-700',
    },
    {
      title: 'Active Stations',
      value: activeStations,
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-br from-teal-600 to-teal-700',
      lightBg: 'bg-teal-50',
      textColor: 'text-teal-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="mb-2 sm:mb-4">
            <div className="h-1 w-12 sm:w-16 bg-lime-500 rounded mb-3"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-900">Operator Dashboard</h1>
            <p className="text-teal-700 mt-1 text-sm sm:text-base">Monitor your assigned stations and bookings</p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Header with Profile and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 lg:col-span-1">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 font-bold mr-4 ring-1 ring-teal-200">
                      {(user?.email || 'OP')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Station Operator</h3>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-200">● Active</span>
                </div>
                {panelData?.message && (
                  <div className="mt-4 bg-lime-50 border border-lime-200 text-lime-700 px-3 py-2 rounded">
                    {panelData.message}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {statCards.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <dt className="text-xs sm:text-sm font-medium text-gray-600 truncate mb-2">{stat.title}</dt>
                            <dd className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</dd>
                          </div>
                          <div className={`flex-shrink-0 ${stat.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                            <Icon className="text-white" size={24} />
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className={`h-1.5 ${stat.lightBg} rounded-full overflow-hidden`}>
                            <div className={`h-full ${stat.bgColor} rounded-full transition-all duration-1000`} style={{ width: '75%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Assigned Stations + Map */}
          {stations && stations.length > 0 && (
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-teal-900">Assigned Station Map</h2>
                <p className="text-sm text-gray-600 mt-1">Your operational charging stations</p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="rounded-lg overflow-hidden">
                  <StationsMap stations={stations.map(s => ({ ...s, lat: s.lat ?? s.Lat, lng: s.lng ?? s.Lng }))} height="360px" />
                </div>
              </div>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-lime-50">
              <h3 className="text-lg sm:text-xl font-bold text-teal-900">Bookings</h3>
              <p className="text-sm text-gray-600 mt-1">Manage and review upcoming reservations</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by station or owner NIC..."
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={16} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="hidden md:inline">Showing</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                    {filteredBookings.length}
                  </span>
                  <span>of</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                    {bookings.length}
                  </span>
                  <span className="hidden md:inline">bookings</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg ring-1 ring-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner NIC</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Calendar size={28} className="text-gray-400" />
                            <span className="text-sm">No bookings found</span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {filteredBookings.map((b, idx) => (
                      <tr key={b.id || b._id || idx} className="hover:bg-gray-50 transition odd:bg-white even:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(b.ReservationAtUtc || b.reservationAtUtc || b.ReservationAt || b.reservationAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.station?.location || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.OwnerNic || b.ownerNic || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs leading-5 font-semibold rounded-full ${
                            (b.statusText) === 'Completed' ? 'bg-green-100 text-green-800' :
                            (b.statusText) === 'Active' ? 'bg-blue-100 text-blue-800' :
                            (b.statusText) === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (b.statusText) === 'Completed' ? 'bg-green-600' :
                              (b.statusText) === 'Active' ? 'bg-blue-600' :
                              (b.statusText) === 'Cancelled' ? 'bg-red-600' :
                              'bg-yellow-600'
                            }`}></span>
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
        </div>
      </main>
    </div>
  );
};

export default OperatorDashboard;
