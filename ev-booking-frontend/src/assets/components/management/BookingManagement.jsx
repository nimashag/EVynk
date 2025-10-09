import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Zap,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Activity,
  Edit2,
  Trash2,
  Play,
  CheckSquare,
  Filter,
  Search,
} from "lucide-react";
import { authService } from "../../services/authService";
import Navigation from "../common/Navigation";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    booking: null,
  });
  const [formData, setFormData] = useState({
    evOwnerId: "",
    chargingStationId: "",
    reservationDate: "",
    reservationTime: "",
    status: "Pending",
  });

  const statusMap = {
    1: "Pending",
    2: "Active",
    3: "Completed",
    4: "Cancelled",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsResult, stationsResult, ownersResult] = await Promise.all([
        authService.getBookings(),
        authService.getChargingStations(),
        authService.getEVOwners(),
      ]);

      if (bookingsResult.success) setBookings(bookingsResult.data);
      if (stationsResult.success) setStations(stationsResult.data);
      if (ownersResult.success) setOwners(ownersResult.data);
    } catch (err) {
      setError("Failed to load data");
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reservationDateTime = new Date(
      `${formData.reservationDate}T${formData.reservationTime}`
    );
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (reservationDateTime < now) {
      showToast("Reservation date cannot be in the past", "error");
      return;
    }

    if (reservationDateTime > sevenDaysFromNow) {
      showToast(
        "Reservation date cannot be more than 7 days from now",
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      let result;
      if (editingBooking) {
        result = await authService.updateBooking(editingBooking.id, formData);
      } else {
        result = await authService.createBooking(formData);
      }

      if (result.success) {
        showToast(
          editingBooking
            ? "Booking updated successfully!"
            : "Booking created successfully!",
          "success"
        );
        resetForm();
        fetchData();
      } else {
        showToast(result.error, "error");
      }
    } catch (err) {
      showToast("Failed to save booking", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    const reservationDate = new Date(booking.reservationAtUtc)
      .toISOString()
      .split("T")[0];
    const reservationTime = new Date(booking.reservationAtUtc)
      .toTimeString()
      .split(" ")[0]
      .substring(0, 5);

    setFormData({
      evOwnerId: booking.ownerNic,
      chargingStationId: booking.stationId,
      reservationDate: reservationDate,
      reservationTime: reservationTime,
      status: booking.status,
    });
    setShowModal(true);
  };

  const handleCancel = async (booking) => {
    setDeleteConfirm({ show: true, booking });
  };

  const confirmCancel = async () => {
    const booking = deleteConfirm.booking;
    setDeleteConfirm({ show: false, booking: null });

    try {
      setLoading(true);
      const result = await authService.cancelBooking(booking.id);
      if (result.success) {
        showToast("Booking cancelled successfully", "success");
        fetchData();
      } else {
        showToast(result.error, "error");
      }
    } catch (err) {
      showToast("Failed to cancel booking", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStatus = async (booking) => {
    try {
      setLoading(true);
      let result;
      if (booking.status === 1)
        result = await authService.activateBooking(booking.id);
      else if (booking.status === 2)
        result = await authService.completeBooking(booking.id);
      else return;

      if (result.success) {
        showToast(
          `Booking ${
            booking.status === 1 ? "activated" : "completed"
          } successfully`,
          "success"
        );
        fetchData();
      } else {
        showToast(result.error, "error");
      }
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      evOwnerId: "",
      chargingStationId: "",
      reservationDate: "",
      reservationTime: "",
      status: "Pending",
    });
    setEditingBooking(null);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-green-100 text-green-800 border-green-200";
      case 3:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 4:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1:
        return <Clock size={16} />;
      case 2:
        return <Activity size={16} />;
      case 3:
        return <CheckCircle size={16} />;
      case 4:
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const canEditOrCancel = (booking) => {
    const reservationDateTime = new Date(booking.reservationAtUtc);
    const now = new Date();
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    return reservationDateTime > twelveHoursFromNow && booking.status !== 4;
  };

  const filteredBookings = [...bookings].reverse().filter((booking) => {
    const owner = owners.find((o) => o.nic === booking.ownerNic);
    const station = stations.find((s) => s.id === booking.stationId);

    const matchesSearch =
      owner?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station?.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || booking.status === parseInt(filterStatus);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 1).length,
    active: bookings.filter((b) => b.status === 2).length,
    completed: bookings.filter((b) => b.status === 3).length,
    cancelled: bookings.filter((b) => b.status === 4).length,
  };

  const BookingCard = ({ booking }) => {
    const owner = owners.find((o) => o.nic === booking.ownerNic);
    const station = stations.find((s) => s.id === booking.stationId);
    const canModify = canEditOrCancel(booking);

    const reservationDate = new Date(
      booking.reservationAtUtc
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const reservationTime = new Date(
      booking.reservationAtUtc
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg flex-shrink-0">
                <Calendar size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">
                  {owner ? owner.fullName : "Unknown Owner"}
                </h3>
                <p className="text-sm text-gray-500">{owner?.nic || "N/A"}</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                booking.status
              )}`}
            >
              {getStatusIcon(booking.status)}
              {statusMap[booking.status]}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin
                size={16}
                className="text-teal-600 mt-0.5 flex-shrink-0"
              />
              <div>
                <span className="font-medium text-gray-900">
                  {station ? station.location : "Unknown Station"}
                </span>
                <span className="text-gray-500 ml-2">
                  {station?.type === 2 ? "⚡ DC Fast" : "🔌 AC Standard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-teal-600" />
                <span className="font-medium">{reservationDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} className="text-teal-600" />
                <span className="font-medium">{reservationTime}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100">
            {canModify && (
              <>
                <button
                  onClick={() => handleEdit(booking)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleCancel(booking)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition text-sm"
                >
                  <Trash2 size={16} />
                  <span>Cancel</span>
                </button>
              </>
            )}
            {(booking.status === 1 || booking.status === 2) && (
              <button
                onClick={() => handleNextStatus(booking)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium bg-green-50 text-green-600 hover:bg-green-100 transition text-sm"
              >
                {booking.status === 1 ? (
                  <Play size={16} />
                ) : (
                  <CheckSquare size={16} />
                )}
                <span>{booking.status === 1 ? "Activate" : "Complete"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

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

      <div className="bg-gradient-to-r from-teal-900 to-teal-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                  <Calendar size={22} className="text-lime-400" />
                </div>
                Booking Management
              </h1>
              <p className="text-teal-100 mt-2 text-sm">
                Manage and monitor all charging bookings
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-lime-500 hover:bg-lime-400 text-teal-900 font-semibold px-6 py-3 rounded-lg transition shadow-lg shadow-lime-500/30 flex items-center gap-2"
            >
              <Plus size={20} />
              Create New Booking
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">
                    Total Bookings
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <Calendar size={24} className="text-lime-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock size={24} className="text-yellow-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.active}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Activity size={24} className="text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle size={24} className="text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-sm font-medium">Cancelled</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.cancelled}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <XCircle size={24} className="text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by owner or station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="1">Pending</option>
                <option value="2">Active</option>
                <option value="3">Completed</option>
                <option value="4">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-lime-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={resetForm}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-6 py-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                        <Calendar size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {editingBooking
                            ? "Edit Booking"
                            : "Create New Booking"}
                        </h3>
                        <p className="text-xs text-teal-200">
                          {editingBooking
                            ? "Update booking information"
                            : "Schedule a new charging session"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetForm}
                      className="text-white/70 hover:text-white transition"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      EV Owner *
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <select
                        value={formData.evOwnerId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evOwnerId: e.target.value,
                          })
                        }
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      >
                        <option value="">Select EV Owner</option>
                        {owners
                          .filter((owner) => owner.isActive)
                          .map((owner) => (
                            <option key={owner.nic} value={owner.nic}>
                              {owner.fullName} ({owner.nic})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Charging Station *
                    </label>
                    <div className="relative">
                      <Zap
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <select
                        value={formData.chargingStationId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chargingStationId: e.target.value,
                          })
                        }
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      >
                        <option value="">Select Charging Station</option>
                        {stations
                          .filter(
                            (station) =>
                              station.isActive && station.availableSlots > 0
                          )
                          .map((station) => (
                            <option key={station.id} value={station.id}>
                              {station.location} -{" "}
                              {station.type === 2 ? "DC" : "AC"} (
                              {station.availableSlots} slots)
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reservation Date *
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="date"
                          value={formData.reservationDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reservationDate: e.target.value,
                            })
                          }
                          required
                          min={new Date().toISOString().split("T")[0]}
                          max={
                            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split("T")[0]
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reservation Time *
                      </label>
                      <div className="relative">
                        <Clock
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="time"
                          value={formData.reservationTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reservationTime: e.target.value,
                            })
                          }
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <p className="text-sm text-teal-800">
                      <strong>Note:</strong> Bookings can be made up to 7 days
                      in advance. Changes or cancellations must be made at least
                      12 hours before the reservation time.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-teal-900 bg-lime-500 hover:bg-lime-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/30"
                    >
                      {loading
                        ? "Saving..."
                        : editingBooking
                        ? "Update Booking"
                        : "Create Booking"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {deleteConfirm.show && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setDeleteConfirm({ show: false, booking: null })}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <XCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Cancel Booking
                      </h3>
                      <p className="text-xs text-red-100">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-gray-700 text-base">
                      Are you sure you want to cancel this booking? The owner
                      will be notified and the slot will become available again.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setDeleteConfirm({ show: false, booking: null })
                      }
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={confirmCancel}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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

export default BookingManagement;
