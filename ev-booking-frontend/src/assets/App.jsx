import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./components/LandingPage";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import OperatorDashboard from "./components/dashboard/OperatorDashboard";
import StationSlotManagement from "./components/management/StationSlotManagement";
import EVOwnerManagement from "./components/management/EVOwnerManagement";
import ChargingStationManagement from "./components/management/ChargingStationManagement";
import BookingManagement from "./components/management/BookingManagement";
import OperatorBookingManagement from "./components/management/OperatorBookingManagement";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ToastContainer
            position="top-right"
            theme="dark"
            closeOnClick
            pauseOnHover
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="Backoffice">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ev-owners"
              element={
                <ProtectedRoute requiredRole="Backoffice">
                  <EVOwnerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/charging-stations"
              element={
                <ProtectedRoute requiredRole="Backoffice">
                  <ChargingStationManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute requiredRole="Backoffice">
                  <BookingManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/panel"
              element={
                <ProtectedRoute requiredRole="StationOperator">
                  <OperatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/slots"
              element={
                <ProtectedRoute requiredRole="StationOperator">
                  <StationSlotManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/bookings"
              element={
                <ProtectedRoute requiredRole="StationOperator">
                  <OperatorBookingManagement />
                </ProtectedRoute>
              }
            />

            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
