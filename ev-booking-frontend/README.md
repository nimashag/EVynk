# EV Booking Frontend

A React-based frontend application for the EV Booking System, providing authentication and dashboard interfaces for both Backoffice and Station Operator roles.

## Features

- **Authentication System**
  - Sign in for existing users
  - Sign up for new users (with role selection)
  - JWT token-based authentication
  - Role-based access control

- **Role-Based Dashboards**
  - **Backoffice Dashboard**: Administrative interface for system management
  - **Station Operator Panel**: Interface for station operators to manage charging stations

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Beautiful gradient backgrounds
  - Smooth transitions and animations
  - Mobile-friendly interface

## Tech Stack

- **React 19** - Frontend framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and development server

## Getting Started

### Prerequisites

- Node.js (v20.15.1 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd ev-booking-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx          # Sign in form
│   │   ├── RegisterForm.jsx       # Sign up form
│   │   └── ProtectedRoute.jsx     # Route protection component
│   ├── dashboard/
│   │   ├── AdminDashboard.jsx    # Backoffice dashboard
│   │   └── OperatorDashboard.jsx # Station operator panel
│   └── LandingPage.jsx            # Landing page
├── contexts/
│   └── AuthContext.jsx            # Authentication context
├── services/
│   └── authService.js             # API service for authentication
├── App.jsx                        # Main app component with routing
└── main.jsx                       # Application entry point
```

## Authentication Flow

1. **Landing Page**: Users can choose between admin and operator login
2. **Sign In**: Existing users can sign in with email and password
3. **Sign Up**: New users can register with email, password, and role selection
4. **Role-Based Redirect**: After successful authentication, users are redirected based on their role:
   - Backoffice users → `/admin/dashboard`
   - Station Operator users → `/operator/panel`

## API Integration

The frontend integrates with the backend API at `http://localhost:5000/api`:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration (requires Backoffice role)
- `GET /api/admin/dashboard` - Backoffice dashboard data
- `GET /api/operator/panel` - Station operator panel data

## User Roles

- **Backoffice**: Administrative access to system management
- **StationOperator**: Access to station management and monitoring

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Setup

Make sure the backend API is running on `http://localhost:5000` before starting the frontend development server.

## Security Features

- JWT token storage in localStorage
- Automatic token refresh handling
- Role-based route protection
- Secure API communication with axios interceptors
- Automatic logout on token expiration

## Styling

The application uses Tailwind CSS for styling with:
- Custom gradient backgrounds
- Responsive grid layouts
- Modern form styling
- Smooth hover effects and transitions
- Mobile-first responsive design