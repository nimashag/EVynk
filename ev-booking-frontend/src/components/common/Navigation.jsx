import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                🚗 EV Booking System
              </h1>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              {user.role === 'Backoffice' && (
                <>
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      isActive('/admin/dashboard')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/admin/ev-owners')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      isActive('/admin/ev-owners')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    EV Owners
                  </button>
                  <button
                    onClick={() => navigate('/admin/charging-stations')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      isActive('/admin/charging-stations')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Stations
                  </button>
                  <button
                    onClick={() => navigate('/admin/bookings')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      isActive('/admin/bookings')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Bookings
                  </button>
                </>
              )}
              {user.role === 'StationOperator' && (
                <button
                  onClick={() => navigate('/operator/panel')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    isActive('/operator/panel')
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Operator Panel
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Welcome, {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

