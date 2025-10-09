import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import Navigation from "../common/Navigation";
import StationsMap from "../common/StationsMap";
import RoleManagement from "../management/RoleManagement";
import { Zap, CheckCircle, Calendar, Users, ChevronRight } from "lucide-react";

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState({
    totalStations: 0,
    activeStations: 0,
    totalBookings: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const result = await authService.getChargingStations();
      if (result.success) {
        console.log("🏢 Raw Admin Stations:", result.data);
        if (result.data && result.data.length > 0) {
          console.log(
            "📍 Admin First station detail:",
            JSON.stringify(result.data[0], null, 2)
          );
        }
        setStations(result.data);
      }
    } catch (err) {
      console.error("Failed to load stations for map");
    }
  };

  const fetchStats = async () => {
    try {
      const [stationsResult, bookingsResult, usersResult] = await Promise.all([
        authService.getChargingStations(),
        authService.getBookings(),
        authService.getEVOwners(),
      ]);

      if (
        stationsResult.success &&
        bookingsResult.success &&
        usersResult.success
      ) {
        const stationsData = stationsResult.data;
        const bookingsData = bookingsResult.data;
        const usersData = usersResult.data;

        setStats({
          totalStations: stationsData.length,
          activeStations: stationsData.filter((s) => s.isActive).length,
          totalBookings: bookingsData.length,
          activeUsers: usersData.filter((u) => u.isActive).length,
        });
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  const handleLogout = () => {
    logout();
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
      title: "Total Stations",
      value: stats.totalStations,
      icon: Zap,
      bgColor: "bg-gradient-to-br from-teal-500 to-teal-600",
      lightBg: "bg-teal-50",
      textColor: "text-teal-700",
    },
    {
      title: "Active Stations",
      value: stats.activeStations,
      icon: CheckCircle,
      bgColor: "bg-gradient-to-br from-lime-500 to-lime-600",
      lightBg: "bg-lime-50",
      textColor: "text-lime-700",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      bgColor: "bg-gradient-to-br from-teal-600 to-teal-700",
      lightBg: "bg-teal-50",
      textColor: "text-teal-700",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Users,
      bgColor: "bg-gradient-to-br from-lime-600 to-lime-700",
      lightBg: "bg-lime-50",
      textColor: "text-lime-700",
    },
  ];

  const managementCards = [
    {
      title: "EV Owner Management",
      description: "Manage EV owners",
      icon: Users,
      route: "/admin/ev-owners",
      bgColor: "bg-gradient-to-br from-teal-500 to-teal-600",
      hoverBorder: "hover:border-teal-400",
    },
    {
      title: "Charging Stations",
      description: "Manage stations",
      icon: Zap,
      route: "/admin/charging-stations",
      bgColor: "bg-gradient-to-br from-lime-500 to-lime-600",
      hoverBorder: "hover:border-lime-400",
    },
    {
      title: "Booking Management",
      description: "Manage bookings",
      icon: Calendar,
      route: "/admin/bookings",
      bgColor: "bg-gradient-to-br from-teal-600 to-teal-700",
      hoverBorder: "hover:border-teal-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="mb-4 sm:mb-6">
            <div className="h-1 w-12 sm:w-16 bg-lime-500 rounded mb-3"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-900">
              Welcome back, {user?.name || "Admin"}!
            </h1>
            <p className="text-teal-700 mt-1 text-sm sm:text-base">
              Manage your charging station network
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <dt className="text-xs sm:text-sm font-medium text-gray-600 truncate mb-2">
                          {stat.title}
                        </dt>
                        <dd className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {stat.value}
                        </dd>
                      </div>
                      <div
                        className={`flex-shrink-0 ${stat.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="text-white" size={24} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div
                        className={`h-1.5 ${stat.lightBg} rounded-full overflow-hidden`}
                      >
                        <div
                          className={`h-full ${stat.bgColor} rounded-full transition-all duration-1000`}
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stations Map */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-teal-900">
                Station Locations
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Real-time view of all charging stations
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="rounded-lg overflow-hidden">
                <StationsMap
                  stations={stations.map((s) => {
                    console.log("🔄 Admin normalizing station:", {
                      id: s.id,
                      rawLat: s.lat,
                      rawLng: s.lng,
                      hasCoords: !!(s.lat && s.lng),
                    });
                    return s;
                  })}
                  height="400px"
                />
              </div>
            </div>
          </div>

          {/* Management Sections */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-4 sm:mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {managementCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    onClick={() => navigate(card.route)}
                    className={`group bg-white overflow-hidden shadow-lg rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent ${card.hoverBorder} transform hover:-translate-y-1`}
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`${card.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="text-white" size={24} />
                        </div>
                        <ChevronRight
                          className="text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-300"
                          size={24}
                        />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-teal-800 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {card.description}
                      </p>
                    </div>
                    <div
                      className={`h-1 ${card.bgColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Management */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-lime-50">
              <h3 className="text-lg sm:text-xl font-bold text-teal-900">
                Role Management
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage user roles and permissions
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <RoleManagement />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
