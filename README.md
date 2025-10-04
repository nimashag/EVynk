# EVynk EV Charging Station Booking System (C#/.NET 8)

A comprehensive EV charging station booking system backend API built with .NET 8, MongoDB, JWT authentication, and role-based access control. Features complete booking management, charging station administration, and EV owner management with NIC as the primary key.

## Prerequisites
- .NET 8 SDK
- MongoDB (local or Atlas)
- PowerShell or terminal

## Project Structure (key folders)
- `Controllers/` — API controllers (Auth, Admin, Operator, Owners, Bookings, ChargingStations)
- `Models/` — domain models (`User`, `Owner`, `Booking`, `ChargingStation`)
- `Repositories/` — MongoDB data access layer
- `Services/` — business logic layer
- `Config/` — configuration models
- `Persistence/` — MongoDB context and connection
- `Program.cs` — application entry point and dependency injection configuration

## Configuration
Settings come from `appsettings.json`, environment variables, or user-secrets.

### MongoDB
- `MongoDb:ConnectionString`, `MongoDb:DatabaseName`
- Example (Atlas SRV):
```
MongoDb:ConnectionString = mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=EVynk
MongoDb:DatabaseName = evynk_booking

```

### JWT
- `Jwt:Issuer`, `Jwt:Audience`, `Jwt:Secret`, `Jwt:ExpiryMinutes`
- Generate a 256-bit Base64 secret (PowerShell):
  
```
$bytes = New-Object byte[] 32; [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes); [Convert]::ToBase64String($bytes)

```

### Local secrets (recommended)
```
dotnet user-secrets init

dotnet user-secrets set "MongoDb:ConnectionString" "<your-mongodb-uri>"
dotnet user-secrets set "MongoDb:DatabaseName" "evynk_booking"
dotnet user-secrets set "Jwt:Secret" "<your-256-bit-base64-secret>"

```
Note: `appsettings.json` is ignored by git.

## Install & Run
```
dotnet restore
 dotnet run

```
- Swagger UI: `https://localhost:5000/swagger`
- Trust dev cert if needed: `dotnet dev-certs https --trust`

## Roles
- `Backoffice`: system administration; manages users and EV Owners
- `StationOperator`: operational endpoints only

## Features Implemented

### Core Features
- **Hello World Endpoint** (`GET /api/hello`) - Basic health check
- **JWT Authentication** with BCrypt password hashing
- **Role-based Authorization**: Backoffice, StationOperator
- **User Management**: Register (Backoffice-only), Login

### EV Owner Management (Backoffice-only)
- Create/Update/Delete owners by NIC (primary key)
- Activate/Deactivate owner accounts
- List all owners
- NIC-based identification system

### Charging Station Management (Backoffice-only)
- Create/Update/Delete charging stations
- Manage station availability and active status
- Update available slots
- Support for AC/DC station types
- Location-based station management

### Booking Management (Backoffice-only)
- Create bookings with 7-day advance window policy
- Update bookings (with 12-hour advance restriction)
- Cancel bookings (with 12-hour advance restriction)
- Booking lifecycle management: Pending → Active → Completed
- Status tracking: Pending, Active, Completed, Cancelled

### Data Collections
- `users` - System users (Backoffice, StationOperator)
- `ev-owners` - EV owners with NIC as primary key
- `charging-stations` - Charging station inventory
- `bookings` - Reservation records

## Data Models

### User Model
```csharp
public class User
{
    public string Id { get; set; }           // MongoDB ObjectId
    public string Email { get; set; }        // User email
    public string PasswordHash { get; set; } // BCrypt hashed password
    public UserRole Role { get; set; }       // Backoffice or StationOperator
}

public enum UserRole
{
    Backoffice = 1,
    StationOperator = 2
}
```

### Owner Model
```csharp
public class Owner
{
    public string Nic { get; set; }      // NIC as primary key
    public string FullName { get; set; } // Owner's full name
    public string Email { get; set; }    // Contact email
    public string Phone { get; set; }    // Contact phone
    public bool IsActive { get; set; }   // Account status
}
```

### ChargingStation Model
```csharp
public class ChargingStation
{
    public string Id { get; set; }           // MongoDB ObjectId
    public string Location { get; set; }     // Station location
    public StationType Type { get; set; }    // AC or DC
    public int AvailableSlots { get; set; }   // Available charging slots
    public bool IsActive { get; set; }       // Station status
}

public enum StationType
{
    AC = 1,  // Alternating Current
    DC = 2   // Direct Current
}
```

### Booking Model
```csharp
public class Booking
{
    public string Id { get; set; }                    // MongoDB ObjectId
    public string StationId { get; set; }            // Reference to charging station
    public string OwnerNic { get; set; }              // Reference to EV owner
    public DateTime ReservationAtUtc { get; set; }    // Reservation time (UTC)
    public DateTime CreatedAtUtc { get; set; }       // Booking creation time
    public BookingStatus Status { get; set; }         // Current booking status
}

public enum BookingStatus
{
    Pending = 1,    // Booking created, awaiting activation
    Active = 2,      // Booking activated, charging in progress
    Completed = 3,   // Charging session completed
    Cancelled = 4    // Booking cancelled
}
```

## Business Rules & Constraints

### Booking Policies
- **7-Day Advance Window**: Bookings can only be made up to 7 days in advance
- **12-Hour Modification Window**: Bookings can only be updated or cancelled up to 12 hours before the reservation time
- **Booking Lifecycle**: Pending → Active → Completed (or Cancelled)

### Charging Station Management
- **Active Status Protection**: Stations with active bookings cannot be deactivated
- **Slot Management**: Available slots can be updated independently of station details
- **Type Support**: Both AC (Alternating Current) and DC (Direct Current) charging types supported

### EV Owner Management
- **NIC as Primary Key**: National Identity Card number serves as unique identifier
- **Account Status**: Owners can be activated/deactivated without deletion
- **Contact Information**: Full name, email, and phone number required

### Authentication & Authorization
- **Role-Based Access**: Backoffice (full access) vs StationOperator (limited access)
- **JWT Security**: All protected endpoints require valid JWT token
- **Password Security**: BCrypt hashing for password storage

## Complete API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user (Backoffice only)
- `POST /api/auth/login` — Login and get JWT token

### Hello World
- `GET /api/hello` — Basic health check endpoint

### Admin Dashboard (Backoffice only)
- `GET /api/admin/dashboard` — Admin dashboard access

### Station Operator (StationOperator only)
- `GET /api/operator/panel` — Operator panel access

### EV Owners Management (Backoffice only)
- `GET /api/owners` — List all EV owners
- `POST /api/owners` — Create new EV owner
- `PUT /api/owners/{nic}` — Update EV owner by NIC
- `DELETE /api/owners/{nic}` — Delete EV owner by NIC
- `PUT /api/owners/{nic}/activate` — Activate EV owner account
- `PUT /api/owners/{nic}/deactivate` — Deactivate EV owner account

### Charging Stations Management (Backoffice only)
- `GET /api/chargingstations` — List all charging stations
- `POST /api/chargingstations` — Create new charging station
- `PUT /api/chargingstations/{id}` — Update charging station
- `PUT /api/chargingstations/{id}/slots` — Update available slots
- `PATCH /api/chargingstations/{id}/active` — Set station active/inactive status

### Booking Management (Backoffice only)
- `POST /api/bookings` — Create new booking (7-day advance window)
- `PUT /api/bookings/{id}` — Update booking (12-hour advance restriction)
- `DELETE /api/bookings/{id}` — Cancel booking (12-hour advance restriction)
- `PATCH /api/bookings/{id}/activate` — Activate booking (Pending → Active)
- `PATCH /api/bookings/{id}/complete` — Complete booking (Active → Completed)

## Testing with Swagger
1. Run the API and open Swagger.
2. Login via `POST /api/auth/login` to get a JWT.
3. Click "Authorize" in Swagger and paste the token (no `Bearer` prefix).
4. Invoke protected endpoints according to role.

## Testing with curl

### Authentication
- **Login**
```bash
curl -k -X POST https://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"Email":"admin@example.com","Password":"Admin#123"}'
```

### EV Owner Management (Backoffice token required)
- **Create EV Owner**
```bash
curl -k -X POST https://localhost:5000/api/owners \
  -H "Authorization: Bearer <BACKOFFICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nic": "902345678V",
    "fullName": "Jane Doe",
    "email": "jane@gmail.com",
    "phone": "+94 77 123 4567"
  }'
```

- **Activate EV Owner**
```bash
curl -k -X PUT https://localhost:5000/api/owners/902345678V/activate \
  -H "Authorization: Bearer <BACKOFFICE_TOKEN>"
```

### Charging Station Management (Backoffice token required)
- **Create Charging Station**
```bash
curl -k -X POST https://localhost:5000/api/chargingstations \
  -H "Authorization: Bearer <BACKOFFICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Colombo City Center",
    "type": 1,
    "availableSlots": 4,
    "isActive": true
  }'
```

- **Update Station Slots**
```bash
curl -k -X PUT https://localhost:5000/api/chargingstations/{stationId}/slots \
  -H "Authorization: Bearer <BACKOFFICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"availableSlots": 6}'
```

### Booking Management (Backoffice token required)
- **Create Booking**
```bash
curl -k -X POST https://localhost:5000/api/bookings \
  -H "Authorization: Bearer <BACKOFFICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "station_object_id",
    "ownerNic": "902345678V",
    "reservationAt": "2024-01-15T10:00:00"
  }'
```

- **Activate Booking**
```bash
curl -k -X PATCH https://localhost:5000/api/bookings/{bookingId}/activate \
  -H "Authorization: Bearer <BACKOFFICE_TOKEN>"
```

## Troubleshooting
- HTTPS redirect warning: trust dev cert or run HTTP only.
- 401/403: ensure token role matches endpoint.
- Mongo issues: verify connection string/IP allowlist and `DatabaseName`.
