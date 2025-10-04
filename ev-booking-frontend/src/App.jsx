import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AdminDashboard from './components/dashboard/AdminDashboard';
import OperatorDashboard from './components/dashboard/OperatorDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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
              path="/operator/panel" 
              element={
                <ProtectedRoute requiredRole="StationOperator">
                  <OperatorDashboard />
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
