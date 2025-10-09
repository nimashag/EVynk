import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import Navigation from "../common/Navigation";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  AlertCircle,
  Plus,
  X,
  Zap,
  Activity,
  Play,
  CheckSquare,
} from "lucide-react";

const OperatorBookingManagement = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stationFilter, setStationFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    booking: null,
  });

  // Form states
  const [formData, setFormData] = useState({
    stationId: "",
    ownerNic: "",
    reservationDate: "",
    reservationTime: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 4000);
    }
  };

  const fetchData = async () => {
    try {
      const [bookingsRes, stationsRes] = await Promise.all([
        authService.getOperatorBookings(),
        authService.getOperatorStations(),
      ]);

      if (bookingsRes.success) {
        const normalizedBookings = (bookingsRes.data || []).map((booking) => {
          const statusValue = booking.Status ?? booking.status;
          let statusText;

          if (typeof statusValue === "number") {
            const statusMap = {
              1: "Pending",
              2: "Active",
              3: "Completed",
              4: "Cancelled",
            };
            statusText = statusMap[statusValue] || "Pending";
          } else {
            statusText = statusValue || "Pending";
          }

          return {
            ...booking,
            statusText: statusText,
            status: statusValue,
          };
        });

        setBookings(normalizedBookings);
      }
      if (stationsRes.success) {
        setStations(stationsRes.data || []);
      }
    } catch (err) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusText =
      typeof status === "number"
        ? { 1: "Pending", 2: "Active", 3: "Completed", 4: "Cancelled" }[status]
        : status;

    switch (statusText) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    const statusText =
      typeof status === "number"
        ? { 1: "Pending", 2: "Active", 3: "Completed", 4: "Cancelled" }[status]
        : status;

    switch (statusText) {
      case "Pending":
        return <Clock size={16} />;
      case "Active":
        return <Activity size={16} />;
      case "Completed":
        return <CheckCircle size={16} />;
      case "Cancelled":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const canModifyBooking = (reservationDate) => {
    const reservation = new Date(reservationDate);
    const now = new Date();
    const hoursDiff = (reservation - now) / (1000 * 60 * 60);
    return hoursDiff >= 12;
  };

  const isWithin7Days = (dateString) => {
    const reservation = new Date(dateString);
    const now = new Date();
    const daysDiff = (reservation - now) / (1000 * 60 * 60 * 24);
    return daysDiff >= 0 && daysDiff <= 7;
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      const reservationDateTime = new Date(
        `${formData.reservationDate}T${formData.reservationTime}`
      );

      if (!isWithin7Days(reservationDateTime)) {
        showToast("Reservation must be within 7 days from now", "error");
        setProcessing(false);
        return;
      }

      const result = await authService.createBooking({
        stationId: formData.stationId,
        ownerNic: formData.ownerNic,
        reservationAtUtc: reservationDateTime.toISOString(),
      });

      if (result.success) {
        showToast("Booking created successfully!", "success");
        setShowCreateModal(false);
        setFormData({
          stationId: "",
          ownerNic: "",
          reservationDate: "",
          reservationTime: "",
        });
        fetchData();
      } else {
        showToast(result.error || "Failed to create booking", "error");
      }
    } catch (err) {
      showToast("Failed to create booking", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    if (!canModifyBooking(selectedBooking.reservationAtUtc)) {
      showToast(
        "Cannot modify booking less than 12 hours before reservation",
        "error"
      );
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const reservationDateTime = new Date(
        `${formData.reservationDate}T${formData.reservationTime}`
      );

      if (!isWithin7Days(reservationDateTime)) {
        showToast("Reservation must be within 7 days from now", "error");
        setProcessing(false);
        return;
      }

      const result = await authService.updateBooking(
        selectedBooking.id || selectedBooking._id,
        {
          stationId: formData.stationId,
          ownerNic: formData.ownerNic,
          reservationAtUtc: reservationDateTime.toISOString(),
        }
      );

      if (result.success) {
        showToast("Booking updated successfully!", "success");
        setShowEditModal(false);
        setSelectedBooking(null);
        fetchData();
      } else {
        showToast(result.error || "Failed to update booking", "error");
      }
    } catch (err) {
      showToast("Failed to update booking", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedBooking) return;

    const currentStatus = selectedBooking.statusText || "Pending";
    let isValidTransition = false;

    if (newStatus === "Cancelled") {
      isValidTransition = true;
      if (!canModifyBooking(selectedBooking.reservationAtUtc)) {
        showToast(
          "Cannot cancel booking less than 12 hours before reservation",
          "error"
        );
        return;
      }
    } else if (currentStatus === "Pending" && newStatus === "Active") {
      isValidTransition = true;
    } else if (currentStatus === "Active" && newStatus === "Completed") {
      isValidTransition = true;
    }

    if (!isValidTransition) {
      showToast(
        `Cannot change status from ${currentStatus} to ${newStatus}`,
        "error"
      );
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const result = await authService.updateBookingStatus(
        selectedBooking.id || selectedBooking._id,
        newStatus
      );

      if (result.success) {
        showToast(`Booking status updated to ${newStatus}!`, "success");
        setShowStatusModal(false);
        setSelectedBooking(null);
        fetchData();
      } else {
        showToast(result.error || "Failed to update status", "error");
      }
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!canModifyBooking(booking.reservationAtUtc)) {
      showToast(
        "Cannot cancel booking less than 12 hours before reservation",
        "error"
      );
      return;
    }
    setDeleteConfirm({ show: true, booking });
  };

  const confirmCancel = async () => {
    const booking = deleteConfirm.booking;
    setDeleteConfirm({ show: false, booking: null });

    try {
      setProcessing(true);
      const result = await authService.updateBookingStatus(
        booking.id || booking._id,
        "Cancelled"
      );

      if (result.success) {
        showToast("Booking cancelled successfully!", "success");
        fetchData();
      } else {
        showToast(result.error || "Failed to cancel booking", "error");
      }
    } catch (err) {
      showToast("Failed to cancel booking", "error");
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = (booking) => {
    if (!canModifyBooking(booking.reservationAtUtc)) {
      showToast(
        "Cannot edit booking less than 12 hours before reservation",
        "error"
      );
      return;
    }

    setSelectedBooking(booking);
    const reservationDate = new Date(booking.reservationAtUtc);
    setFormData({
      stationId: booking.stationId || booking.station?.id,
      ownerNic: booking.ownerNic || booking.OwnerNic,
      reservationDate: reservationDate.toISOString().split("T")[0],
      reservationTime: reservationDate.toTimeString().slice(0, 5),
    });
    setShowEditModal(true);
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  const resetForm = () => {
    setFormData({
      stationId: "",
      ownerNic: "",
      reservationDate: "",
      reservationTime: "",
    });
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedBooking(null);
  };

  const filteredBookings = [...bookings].reverse().filter((booking) => {
    const statusText = booking.statusText || booking.Status || "Pending";
    const stationId = booking.stationId || booking.station?.id;
    const ownerNic = (booking.ownerNic || booking.OwnerNic || "").toLowerCase();
    const stationLocation = (booking.station?.location || "").toLowerCase();

    const matchesStatus = statusFilter === "ALL" || statusText === statusFilter;
    const matchesStation =
      stationFilter === "ALL" || stationId === stationFilter;
    const matchesSearch =
      search === "" ||
      ownerNic.includes(search.toLowerCase()) ||
      stationLocation.includes(search.toLowerCase());

    return matchesStatus && matchesStation && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.statusText === "Pending").length,
    active: bookings.filter((b) => b.statusText === "Active").length,
    completed: bookings.filter((b) => b.statusText === "Completed").length,
    cancelled: bookings.filter((b) => b.statusText === "Cancelled").length,
  };

  const BookingCard = ({ booking }) => {
    const station = stations.find(
      (s) => s.id === (booking.stationId || booking.station?.id)
    );
    const canModify = canModifyBooking(booking.reservationAtUtc);

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
                  {booking.ownerNic || booking.OwnerNic || "Unknown Owner"}
                </h3>
                <p className="text-sm text-gray-500">
                  NIC: {booking.ownerNic || booking.OwnerNic || "N/A"}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                booking.statusText || booking.Status
              )}`}
            >
              {getStatusIcon(booking.statusText || booking.Status)}
              {booking.statusText || booking.Status || "Pending"}
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
                  {station
                    ? station.location
                    : booking.station?.location || "Unknown Station"}
                </span>
                <span className="text-gray-500 ml-2">
                  {station?.type === 2 || booking.station?.type === 2
                    ? "⚡ DC Fast"
                    : "🔌 AC Standard"}
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
            {booking.statusText !== "Completed" &&
              booking.statusText !== "Cancelled" && (
                <>
                  {canModify && (
                    <>
                      <button
                        onClick={() => openEditModal(booking)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm"
                      >
                        <Edit2 size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition text-sm"
                      >
                        <Trash2 size={16} />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openStatusModal(booking)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium bg-green-50 text-green-600 hover:bg-green-100 transition text-sm"
                  >
                    {booking.statusText === "Pending" ? (
                      <Play size={16} />
                    ) : (
                      <CheckSquare size={16} />
                    )}
                    <span>
                      {booking.statusText === "Pending"
                        ? "Activate"
                        : "Complete"}
                    </span>
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
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
      {success && (
        <div
          className="fixed top-6 right-6 z-50"
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border bg-gradient-to-r from-lime-500 to-lime-600 border-lime-400 text-white">
            <CheckCircle size={22} />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}
      {error && (
        <div
          className="fixed top-6 right-6 z-50"
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border bg-gradient-to-r from-red-500 to-red-600 border-red-400 text-white">
            <XCircle size={22} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
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
                Manage reservations for your charging stations
              </p>
            </div>
            {/* <button
              onClick={() => setShowCreateModal(true)}
              className="bg-lime-500 hover:bg-lime-400 text-teal-900 font-semibold px-6 py-3 rounded-lg transition shadow-lg shadow-lime-500/30 flex items-center gap-2"
            >
              <Plus size={20} />
              Create New Booking
            </button> */}
          </div>

          {/* Stats */}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by owner NIC or station..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* <div className="flex items-center gap-3">
              <MapPin className="text-gray-400" size={20} />
              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
              >
                <option value="ALL">All Stations</option>
                {stations.map((station) => (
                  <option
                    key={station.id || station._id}
                    value={station.id || station._id}
                  >
                    {station.location}
                  </option>
                ))}
              </select>
            </div> */}
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking, idx) => (
              <BookingCard
                key={booking.id || booking._id || idx}
                booking={booking}
              />
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
              {search || statusFilter !== "ALL" || stationFilter !== "ALL"
                ? "Try adjusting your filters"
                : "Create your first booking to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
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
                          Create New Booking
                        </h3>
                        <p className="text-xs text-teal-200">
                          Schedule a new charging session
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

                <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Owner NIC *
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={formData.ownerNic}
                        onChange={(e) =>
                          setFormData({ ...formData, ownerNic: e.target.value })
                        }
                        required
                        placeholder="Enter owner NIC"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
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
                        value={formData.stationId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stationId: e.target.value,
                          })
                        }
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      >
                        <option value="">Select Charging Station</option>
                        {stations.map((station) => (
                          <option
                            key={station.id || station._id}
                            value={station.id || station._id}
                          >
                            {station.location}
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
                      disabled={processing}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-teal-900 bg-lime-500 hover:bg-lime-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/30"
                    >
                      {processing ? "Creating..." : "Create Booking"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBooking && (
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
                        <Edit2 size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Edit Booking
                        </h3>
                        <p className="text-xs text-teal-200">
                          Update booking information
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

                <form onSubmit={handleUpdateBooking} className="p-6 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle
                      className="text-yellow-600 flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <p className="text-xs text-yellow-800">
                      Can only be modified at least 12 hours before reservation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Owner NIC *
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={formData.ownerNic}
                        onChange={(e) =>
                          setFormData({ ...formData, ownerNic: e.target.value })
                        }
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
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
                        value={formData.stationId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stationId: e.target.value,
                          })
                        }
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      >
                        <option value="">Select Charging Station</option>
                        {stations.map((station) => (
                          <option
                            key={station.id || station._id}
                            value={station.id || station._id}
                          >
                            {station.location}
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
                      disabled={processing}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-teal-900 bg-lime-500 hover:bg-lime-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/30"
                    >
                      {processing ? "Updating..." : "Update Booking"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowStatusModal(false)}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                        <CheckCircle size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Update Status
                        </h3>
                        <p className="text-xs text-teal-100">
                          Change booking status
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="text-white/70 hover:text-white transition"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-gray-700">
                    Current Status:{" "}
                    <span className="font-semibold">
                      {selectedBooking.statusText || "Pending"}
                    </span>
                  </p>

                  <div className="space-y-3">
                    {selectedBooking.statusText === "Pending" && (
                      <button
                        onClick={() => handleUpdateStatus("Active")}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Play size={20} />
                        Activate Booking
                      </button>
                    )}

                    {selectedBooking.statusText === "Active" && (
                      <button
                        onClick={() => handleUpdateStatus("Completed")}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckSquare size={20} />
                        Complete Booking
                      </button>
                    )}

                    {(selectedBooking.statusText === "Pending" ||
                      selectedBooking.statusText === "Active") && (
                      <button
                        onClick={() => handleUpdateStatus("Cancelled")}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={20} />
                        Cancel Booking
                      </button>
                    )}

                    {(selectedBooking.statusText === "Completed" ||
                      selectedBooking.statusText === "Cancelled") && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-600">
                          This booking is already{" "}
                          {selectedBooking.statusText.toLowerCase()} and cannot
                          be modified.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
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

export default OperatorBookingManagement;
