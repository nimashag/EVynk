import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Decode token to get user role (simple JWT decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      localStorage.setItem('userRole', role);
      
      return { success: true, token, role };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  // Get admin dashboard data
  async getAdminDashboard() {
    try {
      const response = await api.get('/admin/dashboard');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load dashboard data' 
      };
    }
  },

  // Get operator panel data
  async getOperatorPanel() {
    try {
      const response = await api.get('/operator/panel');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load panel data' 
      };
    }
  },

  // EV Owner Management
  async getEVOwners() {
    try {
      const response = await api.get('/owners');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load EV owners' 
      };
    }
  },

  async createEVOwner(ownerData) {
    try {
      const response = await api.post('/owners', ownerData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create EV owner' 
      };
    }
  },

  async updateEVOwner(nic, ownerData) {
    try {
      const response = await api.put(`/owners/${nic}`, ownerData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update EV owner' 
      };
    }
  },

  async deleteEVOwner(nic) {
    try {
      const response = await api.delete(`/owners/${nic}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete EV owner' 
      };
    }
  },

  async toggleEVOwnerStatus(nic, isActive) {
    try {
      const endpoint = isActive ? `/owners/${nic}/activate` : `/owners/${nic}/deactivate`;
      const response = await api.put(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update EV owner status' 
      };
    }
  },

  // Charging Station Management
  async getChargingStations() {
    try {
      const response = await api.get('/chargingstations');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load charging stations' 
      };
    }
  },

  async createChargingStation(stationData) {
    try {
      const response = await api.post('/chargingstations', stationData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create charging station' 
      };
    }
  },

  async updateChargingStation(id, stationData) {
    try {
      const response = await api.put(`/chargingstations/${id}`, stationData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update charging station' 
      };
    }
  },

  async deleteChargingStation(id) {
    try {
      const response = await api.delete(`/chargingstations/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete charging station' 
      };
    }
  },

  async toggleChargingStationStatus(id, isActive) {
    try {
      const response = await api.patch(`/chargingstations/${id}/active`, { isActive });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update charging station status' 
      };
    }
  },

  // Booking Management
  async getBookings() {
    try {
      const response = await api.get('/bookings');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load bookings' 
      };
    }
  },

  async createBooking(bookingData) {
    try {
      // Transform frontend data to match backend API
      const backendData = {
        StationId: bookingData.chargingStationId,
        OwnerNic: bookingData.evOwnerId, // Assuming this is the NIC
        ReservationAt: new Date(`${bookingData.reservationDate}T${bookingData.reservationTime}`)
      };
      const response = await api.post('/bookings', backendData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create booking' 
      };
    }
  },

  async updateBooking(id, bookingData) {
    try {
      // Transform frontend data to match backend API
      const backendData = {
        StationId: bookingData.chargingStationId,
        OwnerNic: bookingData.evOwnerId, // Assuming this is the NIC
        ReservationAt: new Date(`${bookingData.reservationDate}T${bookingData.reservationTime}`)
      };
      const response = await api.put(`/bookings/${id}`, backendData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update booking' 
      };
    }
  },

  async cancelBooking(id) {
    try {
      const response = await api.delete(`/bookings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel booking' 
      };
    }
  },

  // Register user (only for backoffice users)
  async register(email, password, role) {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        role 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get current user role
  getUserRole() {
    return localStorage.getItem('userRole');
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }
};

export default authService;
