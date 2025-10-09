import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, MapPin, Calendar } from 'lucide-react';

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
    <nav className="bg-gradient-to-r from-teal-900 to-teal-800 shadow-lg border-b border-teal-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
            <img 
                src="../images/logo.png" 
                alt="EVynk Logo" 
                className="h-10 w-auto"
              />
            </div>
            <div className="ml-10 flex items-baseline space-x-2">
              {user.role === 'Backoffice' && (
                <>
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive('/admin/dashboard')
                        ? 'bg-lime-500 text-teal-900 shadow-lg shadow-lime-500/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/admin/ev-owners')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive('/admin/ev-owners')
                        ? 'bg-lime-500 text-teal-900 shadow-lg shadow-lime-500/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Users size={16} />
                    EV Owners
                  </button>
                  <button
                    onClick={() => navigate('/admin/charging-stations')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive('/admin/charging-stations')
                        ? 'bg-lime-500 text-teal-900 shadow-lg shadow-lime-500/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <MapPin size={16} />
                    Stations
                  </button>
                  <button
                    onClick={() => navigate('/admin/bookings')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive('/admin/bookings')
                        ? 'bg-lime-500 text-teal-900 shadow-lg shadow-lime-500/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Calendar size={16} />
                    Bookings
                  </button>
                </>
              )}
              {user.role === 'StationOperator' && (
                <button
                  onClick={() => navigate('/operator/panel')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive('/operator/panel')
                      ? 'bg-lime-500 text-teal-900 shadow-lg shadow-lime-500/30'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Operator Panel
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/70 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              Welcome, <span className="text-lime-300 font-medium">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500/90 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-red-500/30"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;