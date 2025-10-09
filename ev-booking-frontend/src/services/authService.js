import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  // Fetch stations assigned to the logged-in operator
  async getOperatorStations() {
    try {
      const response = await api.get('/operator/station');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load operator stations'
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
      const payload = {
        // Use provided name as display location; fallback to address/coords
        location: stationData.name || stationData.address || (stationData.lat && stationData.lng ? `${stationData.lat}, ${stationData.lng}` : ''),
        address: stationData.address ?? '',
        lat: stationData.lat ?? null,
        lng: stationData.lng ?? null,
        // Backend enum expects numeric (AC=1, DC=2)
        type: stationData.type === 'DC' || stationData.type === 2 ? 2 : 1,
        availableSlots: Number(stationData.availableSlots) || 0,
        isActive: Boolean(stationData.isActive),
        operatorIds: stationData.operatorIds || []
      };
      const response = await api.post('/chargingstations', payload);
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
      const payload = {
        location: stationData.name || stationData.address || (stationData.lat && stationData.lng ? `${stationData.lat}, ${stationData.lng}` : ''),
        address: stationData.address ?? '',
        lat: stationData.lat ?? null,
        lng: stationData.lng ?? null,
        type: stationData.type === 'DC' || stationData.type === 2 ? 2 : 1,
        availableSlots: Number(stationData.availableSlots) || 0,
        isActive: Boolean(stationData.isActive),
        operatorIds: stationData.operatorIds || []
      };
      const response = await api.put(`/chargingstations/${id}`, payload);
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
      const response = await api.delete(`/chargingStations/${id}`);
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

  async getOperatorByEmail(email) {
    try {
      const response = await api.get(`/users/by-email/${encodeURIComponent(email)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Operator not found',
      };
    }
  },

  async getAllOperators() {
    try {
      const response = await api.get('/users/operators');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch operators' };
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

  // Fetch bookings for stations assigned to the logged-in operator using backend aggregation
  async getOperatorBookings() {
    try {
      const response = await api.get('/operator/bookings');
      const payload = response.data || {};
      const stations = payload.stations || [];
      const bookings = payload.bookings || [];

      const stationById = new Map(
        stations.map(s => [String(s.id || s.Id || s._id), s])
      );

      const enriched = bookings.map(b => {
        const sid = String(b.stationId || b.StationId || b.stationID || b.station);
        const station = stationById.get(sid);
        return { ...b, station };
      });

      return { success: true, data: enriched };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load operator bookings'
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

// Booking Management - Status Updates
async activateBooking(id) {
  try {
    const response = await api.patch(`/bookings/${id}/activate`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to activate booking' 
    };
  }
},

async completeBooking(id) {
  try {
    const response = await api.patch(`/bookings/${id}/complete`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to complete booking' 
    };
  }
},

  // Register user (only for backoffice users)
  async register(email, password, role) {
    try {
      // Convert role string to numeric enum value
      const roleValue = role === 'Backoffice' ? 1 : 2; // 1=Backoffice, 2=StationOperator
      
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        role: roleValue 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  // Operator self-signup (no admin required)
  async registerOperator(email, password) {
    try {
      const response = await api.post('/auth/register/operator', { email, password });
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
  },

  // Admin: create user with role (requires Backoffice token)
  async createUserWithRole(email, password, role) {
    try {
      // Convert role string to numeric enum value
      const roleValue = role === 'Backoffice' ? 1 : 2; // 1=Backoffice, 2=StationOperator
      
      const response = await api.post('/auth/register', { email, password, role: roleValue });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create user' };
    }
  },

  // Admin: list operators
  async listOperators() {
    try {
      const response = await api.get('/users/operators');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch operators' };
    }
  }
};

export default authService;
