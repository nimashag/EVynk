# EVynk EV Charging Station Booking System (C#/.NET 8)

Backend API using .NET 8, MongoDB, JWT auth, and role-based access (Backoffice, Station Operator). Includes EV Owner management with NIC as the primary key.

## Prerequisites
- .NET 8 SDK
- MongoDB (local or Atlas)
- PowerShell or terminal

## Project Structure (key folders)
- `Controllers/` — API controllers (Auth, Admin, Operator, Owners)
- `Models/` — domain models (`User`, `Owner`)
- `Repositories/` — MongoDB data access
- `Services/` — business logic
- `Config/` — settings models
- `Persistence/` — Mongo context
- `Program.cs` — app entry and DI configuration

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
- Hello world endpoint (`GET /api/hello`)
- JWT auth with BCrypt password hashing
- Role-based authorization: Backoffice, StationOperator
- User management basics: register (Backoffice-only), login
- EV Owner management (Backoffice-only):
  - Create/Update/Delete owners by NIC (primary key)
  - Activate/Deactivate owner accounts
  - List all owners
- Collections: `users`, `ev-owners`

## Endpoint Summary
- Auth
  - `POST /api/auth/register` — Backoffice only
  - `POST /api/auth/login` — returns JWT
- Admin (Backoffice only)
  - `GET /api/admin/dashboard`
- Station Operator (StationOperator only)
  - `GET /api/operator/panel`
- EV Owners (Backoffice only)
  - `GET /api/owners` — list all
  - `POST /api/owners` — create
  - `PUT /api/owners/{nic}` — update
  - `DELETE /api/owners/{nic}` — delete
  - `PUT /api/owners/{nic}/activate` — activate
  - `PUT /api/owners/{nic}/deactivate` — deactivate

## Testing with Swagger
1. Run the API and open Swagger.
2. Login via `POST /api/auth/login` to get a JWT.
3. Click "Authorize" in Swagger and paste the token (no `Bearer` prefix).
4. Invoke protected endpoints according to role.

## Testing with curl
- Login
```
curl -k -X POST https://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"Email":"admin@example.com","Password":"Admin#123"}'
```
- Create EV Owner (Backoffice token)
```
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
- Activate EV Owner
```
curl -k -X PUT https://localhost:5000/api/owners/902345678V/activate \
  -H "Authorization: Bearer <BACKOFFICE_TOKEN>"
```

## Troubleshooting
- HTTPS redirect warning: trust dev cert or run HTTP only.
- 401/403: ensure token role matches endpoint.
- Mongo issues: verify connection string/IP allowlist and `DatabaseName`.
