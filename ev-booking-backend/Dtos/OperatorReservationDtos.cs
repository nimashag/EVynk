// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OperatorReservationDtos.cs
//  Created: 2025-10-08
//  Description: DTOs for station-operator reservation actions.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Dtos
{
    public record OperatorVerifyRequest(string BookingId, string OwnerNic, string StationId);

    public record OperatorVerifyResponse(
        string Id,
        string OwnerNic,
        string StationId,
        DateTime ReservationAtUtc,
        string Status,
        string StationName
    );
}
