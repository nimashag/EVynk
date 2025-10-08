import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import Navigation from '../common/Navigation';
import StationsMap from '../common/StationsMap';
import { useState as useLocalState } from 'react';
import RoleManagement from '../management/RoleManagement';

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState({
    totalStations: 0,
    activeStations: 0,
    totalBookings: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData();
      fetchStations();
      fetchStats();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const result = await authService.getAdminDashboard();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const result = await authService.getChargingStations();
      if (result.success) {
        setStations(result.data);
      }
    } catch (err) {
      console.error('Failed to load stations for map');
    }
  };

  const fetchStats = async () => {
    try {
      const [stationsResult, bookingsResult, usersResult] = await Promise.all([
        authService.getChargingStations(),
        authService.getBookings(),   // fetch all bookings
        authService.getEVOwners()   // fetch all users
      ]);
  
      if (stationsResult.success && bookingsResult.success && usersResult.success) {
        const stationsData = stationsResult.data;
        const bookingsData = bookingsResult.data;
        const usersData = usersResult.data;
  
        setStats({
          totalStations: stationsData.length,
          activeStations: stationsData.filter(s => s.isActive).length,
          totalBookings: bookingsData.length,
          activeUsers: usersData.filter(u => u.isActive).length
        });
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };
  
  const handleLogout = () => {
    logout();
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Admin'}!
            </h1>
            <p className="text-gray-600">Manage your charging station network</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">🔌</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Stations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalStations}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Stations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.activeStations}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Bookings
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalBookings}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.activeUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stations Map */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="p-6">
              <StationsMap stations={stations} height="500px" />
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Your existing management cards */}
            <div 
              onClick={() => navigate('/admin/ev-owners')}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-300"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        EV Owner Management
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Manage EV owners
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate('/admin/charging-stations')}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 border border-transparent hover:border-green-300"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">🔌</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Charging Stations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Manage stations
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate('/admin/bookings')}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 border border-transparent hover:border-purple-300"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Booking Management
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Manage bookings
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Role Management</h3>
            <RoleManagement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;