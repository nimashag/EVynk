import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import Navigation from "../common/Navigation";
import StationsMap from "../common/StationsMap";
import {
  Zap,
  CheckCircle,
  Calendar,
  Search,
  Filter,
  Power,
  MapPin,
  X,
  XCircle,
  Activity,
  Clock,
} from "lucide-react";

const OperatorDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [panelData, setPanelData] = useState(null);
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // UI state
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user && !authLoading) {
      fetchPanelData();
    }
  }, [user, authLoading]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

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
            if (typeof v === "string") return v;
            const map = {
              1: "Pending",
              2: "Active",
              3: "Completed",
              4: "Cancelled",
            };
            return map[v] || "Pending";
          })(),
        }));
        setBookings(normalized);
      }
    } catch (err) {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStationStatus = async (stationId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const result = await authService.toggleChargingStationStatus(
        stationId,
        newStatus
      );

      if (result.success) {
        setStations((prev) =>
          prev.map((s) =>
            (s.id || s.Id || s._id) === stationId
              ? { ...s, isActive: newStatus, IsActive: newStatus }
              : s
          )
        );
        showToast(
          `Station ${newStatus ? "activated" : "deactivated"} successfully!`,
          "success"
        );
      } else {
        showToast(result.error || "Failed to update station status", "error");
      }
    } catch (err) {
      showToast("Failed to update station status", "error");
    }
  };

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (statusFilter !== "ALL") {
      list = list.filter((b) => b.statusText === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => {
        const stationName = (b.station?.location || "").toLowerCase();
        const nic = (b.ownerNic || b.OwnerNic || "").toLowerCase();
        return stationName.includes(q) || nic.includes(q);
      });
    }
    return list;
  }, [bookings, statusFilter, search]);

  const totalSlots = useMemo(
    () =>
      stations.reduce(
        (sum, s) => sum + (s.availableSlots ?? s.AvailableSlots ?? 0),
        0
      ),
    [stations]
  );
  const activeStations = useMemo(
    () => stations.filter((s) => s.isActive).length,
    [stations]
  );

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      const d = new Date(
        value.ReservationAtUtc || value.reservationAtUtc || value
      );
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleString();
    } catch {
      return "-";
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-lime-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* Toast Messages */}
      {toast.show && (
        <div
          className="fixed top-6 right-6 z-50"
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
              toast.type === "success"
                ? "bg-gradient-to-r from-lime-500 to-lime-600 border-lime-400 text-white"
                : "bg-gradient-to-r from-red-500 to-red-600 border-red-400 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={22} />
            ) : (
              <XCircle size={22} />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                <Activity size={22} className="text-lime-400" />
              </div>
              Operator Dashboard
            </h1>
            <p className="text-teal-100 mt-2 text-sm">
              Monitor your assigned stations and bookings
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">
                    Total Slots
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {totalSlots}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <Zap size={24} className="text-lime-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">
                    Upcoming Bookings
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {bookings.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Calendar size={24} className="text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">
                    Station Status
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {activeStations}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Station Operator
                </h3>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
                {panelData?.message && (
                  <p className="text-sm text-teal-600 mt-2 font-medium">
                    {panelData.message}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Active
              </span>
            </div>
          </div>

          {/* Manage Stations Section */}
          {stations && stations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Power size={20} className="text-teal-600" />
                  Manage Stations
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Control station availability and status
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stations.map((station) => {
                    const stationId = station.id || station.Id || station._id;
                    const isActive =
                      station.isActive ?? station.IsActive ?? false;
                    const location =
                      station.location || station.Location || "Unknown";
                    const address = station.address || station.Address || "";
                    const availableSlots =
                      station.availableSlots ?? station.AvailableSlots ?? 0;
                    const type =
                      station.type === 2 || station.Type === 2 ? "DC" : "AC";

                    return (
                      <div
                        key={stationId}
                        className="rounded-xl p-5 border-2 transition-all hover:shadow-lg"
                        style={{
                          backgroundColor: isActive ? "#f0fdfa" : "#f9fafb",
                          borderColor: isActive ? "#14b8a6" : "#d1d5db",
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                                style={{
                                  background: isActive
                                    ? "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
                                    : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                                }}
                              >
                                <MapPin size={20} className="text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-gray-900">
                                  {location}
                                </h4>
                                {address && (
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {address}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-100 text-teal-800">
                                <Zap size={14} />
                                {type}
                              </span>
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold"
                                style={{
                                  backgroundColor:
                                    availableSlots > 5
                                      ? "#dcfce7"
                                      : availableSlots > 0
                                      ? "#fef3c7"
                                      : "#fee2e2",
                                  color:
                                    availableSlots > 5
                                      ? "#166534"
                                      : availableSlots > 0
                                      ? "#854d0e"
                                      : "#991b1b",
                                }}
                              >
                                <CheckCircle size={14} />
                                {availableSlots} slots
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 ml-4">
                            <button
                              onClick={() =>
                                handleToggleStationStatus(stationId, isActive)
                              }
                              className="relative inline-flex items-center h-7 rounded-full w-14 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:scale-110"
                              style={{
                                background: isActive
                                  ? "linear-gradient(90deg, #14b8a6 0%, #84cc16 100%)"
                                  : "linear-gradient(90deg, #9ca3af 0%, #6b7280 100%)",
                                boxShadow: isActive
                                  ? "0 4px 14px 0 rgba(20, 184, 166, 0.39)"
                                  : "0 4px 14px 0 rgba(156, 163, 175, 0.39)",
                              }}
                            >
                              <span
                                className="inline-block w-5 h-5 transform rounded-full bg-white shadow-md transition-transform duration-300"
                                style={{
                                  transform: isActive
                                    ? "translateX(2rem)"
                                    : "translateX(0.25rem)",
                                }}
                              />
                            </button>
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                              style={{
                                backgroundColor: isActive
                                  ? "#0d9488"
                                  : "#6b7280",
                                color: "white",
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{
                                  backgroundColor: isActive
                                    ? "#a7f3d0"
                                    : "#d1d5db",
                                }}
                              ></span>
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Assigned Stations Map */}
          {stations && stations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-teal-600" />
                  Assigned Station Map
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Your operational charging stations
                </p>
              </div>
              <div className="p-6">
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
                  <StationsMap
                    stations={stations.map((s) => ({
                      ...s,
                      lat: s.lat ?? s.Lat,
                      lng: s.lng ?? s.Lng,
                    }))}
                    height="360px"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={20} className="text-teal-600" />
                Bookings
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage and review upcoming reservations
              </p>
            </div>
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by station or owner NIC..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="text-gray-400" size={20} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Station
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Owner NIC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Calendar size={32} className="text-gray-400" />
                            </div>
                            <span className="text-sm font-medium">
                              No bookings found
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b, idx) => (
                        <tr
                          key={b.id || b._id || idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatDateTime(
                              b.ReservationAtUtc ||
                                b.reservationAtUtc ||
                                b.ReservationAt ||
                                b.reservationAt
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {b.station?.location || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {b.OwnerNic || b.ownerNic || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${
                                b.statusText === "Completed"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : b.statusText === "Active"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : b.statusText === "Cancelled"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }`}
                            >
                              {b.statusText === "Completed" ? (
                                <CheckCircle size={14} />
                              ) : b.statusText === "Active" ? (
                                <Activity size={14} />
                              ) : b.statusText === "Cancelled" ? (
                                <XCircle size={14} />
                              ) : (
                                <Clock size={14} />
                              )}
                              {b.statusText}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

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

export default OperatorDashboard;
