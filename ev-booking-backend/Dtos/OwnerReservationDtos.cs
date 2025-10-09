// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnerReservationDtos.cs
//  Created: 2025-10-08
//  Description: DTOs for Owner reservation CRUD. These are the shapes
//               sent/received by the API; business rules live in services.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Dtos
{
    /// <summary>
    /// Request body for creating a reservation by an EV Owner.
    /// ReservationAt can be local or UTC; the service will normalize to UTC.
    /// </summary>
    public record CreateOwnerReservationRequest(string StationId, DateTime ReservationAt);

    /// <summary>
    /// Request body for updating a reservation by an EV Owner.
    /// Must still satisfy the 7-day window and ≥12-hour cutoff rules.
    /// </summary>
    public record UpdateOwnerReservationRequest(string StationId, DateTime ReservationAt);

    /// <summary>
    /// Standard response DTO for showing a booking to the Owner,
    /// including StationName (derived from ChargingStation).
    /// </summary>
    public record BookingSummaryDto(
        string Id,
        string StationId,
        string StationName,
        string OwnerNic,
        DateTime ReservationAtUtc,
        string Status
    );
}
