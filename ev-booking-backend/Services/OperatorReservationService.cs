using System.Security.Claims;
using EVynk.Booking.Api.Dtos;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;
using Microsoft.AspNetCore.Http;

namespace EVynk.Booking.Api.Services
{
    // ==============================================
    //  Project: EVynk Booking Backend (API)
    //  File: OperatorReservationService.cs
    //  Created: 2025-10-08
    //  Description: Business logic for Station Operator actions:
    //               - Verify a scanned QR payload against server data
    //               - Complete an active charging session
    //               Enforces access to assigned stations when OperatorIds are set.
    //  Author: Student
    // ==============================================
    public class OperatorReservationService
    {
        private readonly IBookingRepository _bookings;
        private readonly ChargingStationService _stations;
        private readonly IHttpContextAccessor _http;

        public OperatorReservationService(
            IBookingRepository bookings,
            ChargingStationService stations,
            IHttpContextAccessor httpContextAccessor)
        {
            // Inline: DI of repositories/services/context
            _bookings = bookings;
            _stations = stations;
            _http = httpContextAccessor;
        }

        // Inline helper: current operator userId from JWT
        private string? CurrentOperatorId =>
            _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Inline helper: guard operator is allowed to act on this station (if OperatorIds configured)
        private static void GuardOperatorAssigned(string? operatorId, ChargingStation station)
        {
            if (string.IsNullOrWhiteSpace(operatorId)) throw new UnauthorizedAccessException("Operator identity missing.");
            var list = station.OperatorIds ?? new List<string>();
            if (list.Count > 0 && !list.Contains(operatorId))
                throw new UnauthorizedAccessException("Operator is not assigned to this station.");
        }

        public async Task<OperatorVerifyResponse> VerifyAsync(OperatorVerifyRequest req)
        {
            // Inline: verify QR payload data against server-side booking and station
            var booking = await _bookings.GetByIdAsync(req.BookingId)
                          ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.OwnerNic != req.OwnerNic || booking.StationId != req.StationId)
                throw new ArgumentException("QR payload does not match booking data.");

            if (booking.Status != BookingStatus.Active)
                throw new InvalidOperationException("Only Active bookings can be verified for charging.");

            var station = await _stations.GetByIdAsync(booking.StationId)
                          ?? throw new ArgumentException("Charging station not found.");

            if (!station.IsActive)
                throw new InvalidOperationException("Station is inactive.");

            // If station has assigned operators, enforce membership
            GuardOperatorAssigned(CurrentOperatorId, station);

            var stationName = station.Location; // or station.Name if you add one later
            return new OperatorVerifyResponse(
                booking.Id,
                booking.OwnerNic,
                booking.StationId,
                booking.ReservationAtUtc,
                booking.Status.ToString(),
                stationName
            );
        }

        public async Task<bool> CompleteAsync(string bookingId)
        {
            // Inline: mark an Active booking as Completed (operator-side finalize)
            var booking = await _bookings.GetByIdAsync(bookingId)
                          ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.Status != BookingStatus.Active)
                throw new InvalidOperationException("Only Active bookings can be completed.");

            var station = await _stations.GetByIdAsync(booking.StationId)
                          ?? throw new ArgumentException("Charging station not found.");

            GuardOperatorAssigned(CurrentOperatorId, station);

            booking.Status = BookingStatus.Completed;
            return await _bookings.UpdateAsync(bookingId, booking);
        }
    }
}
