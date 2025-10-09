import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import Navigation from "../common/Navigation";
import { Zap, MapPin, Power, CheckCircle, X, Activity } from "lucide-react";

const StationSlotManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Slot selector modal state
  const [showSlotSelector, setShowSlotSelector] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [updatingSlots, setUpdatingSlots] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchStations();
    }
  }, [user, authLoading]);

  const showToast = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 4000);
    }
  };

  const fetchStations = async () => {
    try {
      const stationRes = await authService.getOperatorStations();
      if (stationRes.success) {
        setStations(stationRes.data);
      } else {
        showToast(stationRes.error, "error");
      }
    } catch (err) {
      showToast("Failed to load stations", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStationType = (type) => {
    if (typeof type === "number") {
      return type === 1 ? "AC" : type === 2 ? "DC" : "N/A";
    }
    if (typeof type === "string") {
      return type.toUpperCase();
    }
    return "N/A";
  };

  const openSlotSelector = (station) => {
    setSelectedStation(station);
    const totalSlots = station.availableSlots ?? station.AvailableSlots ?? 0;
    // Initialize all slots as available (selected)
    setSelectedSlots(Array.from({ length: totalSlots }, (_, i) => i));
    setShowSlotSelector(true);
  };

  const toggleSlot = (slotIndex) => {
    setSelectedSlots((prev) =>
      prev.includes(slotIndex)
        ? prev.filter((i) => i !== slotIndex)
        : [...prev, slotIndex].sort((a, b) => a - b)
    );
  };

  const handleUpdateSlots = async () => {
    if (!selectedStation) return;

    setUpdatingSlots(true);
    const stationId = selectedStation.id || selectedStation._id;
    const newSlotCount = selectedSlots.length;

    try {
      const result = await authService.updateStationSlots(
        stationId,
        newSlotCount
      );

      if (result.success) {
        // Update the stations list locally
        setStations((prev) =>
          prev.map((station) =>
            station.id === stationId || station._id === stationId
              ? {
                  ...station,
                  availableSlots: newSlotCount,
                  AvailableSlots: newSlotCount,
                }
              : station
          )
        );
        showToast("Slots updated successfully!", "success");
        setShowSlotSelector(false);
        setSelectedStation(null);
      } else {
        showToast(result.error || "Failed to update slots", "error");
      }
    } catch (err) {
      showToast("Failed to update slots", "error");
    } finally {
      setUpdatingSlots(false);
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
            <X size={22} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                <Zap size={22} className="text-lime-400" />
              </div>
              Station Slot Management
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8 ">
        {stations && stations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => {
              const stationId = station.id || station._id;
              const totalSlots =
                station.availableSlots ?? station.AvailableSlots ?? 0;

              return (
                <div
                  key={stationId}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg flex-shrink-0">
                          <MapPin size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900">
                            {station.location || "Unknown Location"}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-teal-100 text-teal-800">
                              {getStationType(station.type || station.Type)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded ${
                                station.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  station.isActive
                                    ? "bg-green-600 animate-pulse"
                                    : "bg-gray-600"
                                }`}
                              ></span>
                              {station.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 font-medium">
                            Available Slots
                          </span>
                          <span className="text-3xl font-bold text-teal-600">
                            {totalSlots}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-lime-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                (totalSlots / 20) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {totalSlots > 0
                            ? `${totalSlots} slots available`
                            : "No slots available"}
                        </p>
                      </div>

                      <button
                        onClick={() => openSlotSelector(station)}
                        className="w-full py-3 px-4 bg-lime-500 hover:bg-lime-400 text-teal-900 text-sm font-semibold rounded-lg transition shadow-lg shadow-lime-500/30 flex items-center justify-center gap-2"
                      >
                        <Zap size={18} />
                        Manage Slots
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Power size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Stations Found
            </h3>
            <p className="text-gray-600">
              You don't have any assigned stations yet.
            </p>
          </div>
        )}
      </main>

      {/* Slot Selector Modal */}
      {showSlotSelector && selectedStation && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowSlotSelector(false)}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-6 py-5 rounded-t-2xl flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                        <Zap size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Manage Charging Slots
                        </h3>
                        <p className="text-xs text-teal-200">
                          {selectedStation.location || "Station"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSlotSelector(false)}
                      className="text-white/70 hover:text-white transition"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="mb-6 flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div>
                      <p className="text-sm text-teal-800 font-medium">
                        Select available slots
                      </p>
                      <p className="text-xs text-teal-600 mt-1">
                        Click on slots to toggle availability
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-teal-600">
                        {selectedSlots.length}
                      </p>
                      <p className="text-xs text-teal-700 font-medium">
                        Available
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-lg shadow-sm"></div>
                      <span className="text-sm text-gray-700 font-semibold">
                        Available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg shadow-sm"></div>
                      <span className="text-sm text-gray-700 font-semibold">
                        Occupied
                      </span>
                    </div>
                  </div>

                  {/* Slot Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {Array.from(
                      {
                        length:
                          (selectedStation.availableSlots ??
                            selectedStation.AvailableSlots ??
                            0) + 10,
                      },
                      (_, i) => {
                        const isSelected = selectedSlots.includes(i);
                        return (
                          <button
                            key={i}
                            onClick={() => toggleSlot(i)}
                            className={`aspect-square rounded-lg font-bold text-base transition-all duration-200 transform hover:scale-105 shadow-md ${
                              isSelected
                                ? "bg-gradient-to-br from-lime-400 to-lime-500 text-teal-900 hover:from-lime-500 hover:to-lime-600 ring-2 ring-lime-300"
                                : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 hover:from-gray-400 hover:to-gray-500"
                            }`}
                            title={
                              isSelected
                                ? "Click to mark as occupied"
                                : "Click to mark as available"
                            }
                          >
                            {i + 1}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setShowSlotSelector(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSlots}
                    disabled={updatingSlots}
                    className="px-6 py-3 text-sm font-semibold text-teal-900 bg-lime-500 hover:bg-lime-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/30 flex items-center gap-2"
                  >
                    {updatingSlots ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-900 border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Update Slots ({selectedSlots.length})
                      </>
                    )}
                  </button>
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

export default StationSlotManagement;
