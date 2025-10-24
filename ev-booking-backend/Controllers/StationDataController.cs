using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

// ==============================================
// Project: EVynk Booking Backend (API)
// File: StationDataController.cs
// Created: 2025-01-27
// Description: Simplified station data endpoints for mobile apps.
// Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/station-data")]
    [Authorize(Roles = "StationOperator")]
    public class StationDataController : ControllerBase
    {
        private readonly ChargingStationService _service;
        private readonly BookingService _bookingService;
        private readonly IBookingRepository _bookingRepository;

        public StationDataController(
            ChargingStationService service,
            BookingService bookingService,
            IBookingRepository bookingRepository)
        {
            _service = service;
            _bookingService = bookingService;
            _bookingRepository = bookingRepository;
        }

        // ==============================================
        // 1. Get simplified station data
        // ==============================================
        /// <summary>
        /// Get simplified station data for the authenticated operator.
        /// Returns only: type, location, availableSlots
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyStations()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "User ID claim missing." });

                var allStations = await _service.ListAsync();
                var myStations = allStations
                    .Where(s => s.OperatorIds != null && s.OperatorIds.Contains(userId))
                    .Select(s => new
                    {
                        id = s.Id,
                        type = s.Type.ToString(),
                        location = s.Location,
                        availableSlots = s.AvailableSlots
                    })
                    .ToList();

                return Ok(myStations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching station data",
                    error = ex.Message
                });
            }
        }

        // ==============================================
        // 2. Update available slots for a specific station
        // ==============================================
        [HttpPut("{stationId}/slots")]
        public async Task<IActionResult> UpdateSlots(string stationId, [FromBody] UpdateSlotsRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "User ID claim missing." });

                var station = await _service.GetByIdAsync(stationId);
                if (station == null)
                    return NotFound(new { message = "Station not found." });

                if (station.OperatorIds == null || !station.OperatorIds.Contains(userId))
                    return Forbid("You don't have permission to update this station.");

                var success = await _service.SetAvailableSlotsAsync(stationId, request.AvailableSlots);
                if (!success)
                    return NotFound(new { message = "Failed to update station slots." });

                return Ok(new
                {
                    message = "Station slots updated successfully",
                    stationId,
                    availableSlots = request.AvailableSlots
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while updating station slots",
                    error = ex.Message
                });
            }
        }

        // ==============================================
        // 3. Update station details (type, location, availableSlots)
        // ==============================================
        [HttpPut("update-station")]
        public async Task<IActionResult> UpdateStation([FromBody] UpdateStationRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "User ID claim missing." });

                var allStations = await _service.ListAsync();
                var station = allStations
                    .Where(s => s.OperatorIds != null && s.OperatorIds.Contains(userId))
                    .FirstOrDefault(s => s.Location == request.Location);

                if (station == null)
                    return NotFound(new
                    {
                        message = "Station not found or you don't have permission to update it."
                    });

                var updatedStation = new ChargingStation
                {
                    Id = station.Id,
                    Location = request.Location,
                    Address = station.Address,
                    Lat = station.Lat,
                    Lng = station.Lng,
                    Type = request.Type,
                    AvailableSlots = request.AvailableSlots,
                    IsActive = station.IsActive,
                    OperatorIds = station.OperatorIds
                };

                var success = await _service.UpdateAsync(station.Id, updatedStation);
                if (!success)
                    return NotFound(new { message = "Failed to update station." });

                return Ok(new
                {
                    message = "Station updated successfully",
                    type = request.Type.ToString(),
                    location = request.Location,
                    availableSlots = request.AvailableSlots
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while updating station",
                    error = ex.Message
                });
            }
        }

        // ==============================================
        // 4. Update only available slots using station ID
        // ==============================================
        [HttpPut("station/{stationId}/slots")]
        public async Task<IActionResult> UpdateSlotsOnly(string stationId, [FromBody] UpdateSlotsOnlyRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "User ID claim missing." });

                var station = await _service.GetByIdAsync(stationId);
                if (station == null)
                    return NotFound(new { message = "Station not found." });

                if (station.OperatorIds == null || !station.OperatorIds.Contains(userId))
                    return Forbid("You don't have permission to update this station.");

                var success = await _service.SetAvailableSlotsAsync(stationId, request.AvailableSlots);
                if (!success)
                    return NotFound(new { message = "Failed to update station slots." });

                return Ok(new
                {
                    message = "Station slots updated successfully",
                    stationId,
                    availableSlots = request.AvailableSlots
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while updating station slots",
                    error = ex.Message
                });
            }
        }

        // ==============================================
        // 5. Get active bookings for operator's stations
        // ==============================================
        [HttpGet("active-bookings")]
        public async Task<IActionResult> GetActiveBookings()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "User ID claim missing." });

                var allStations = await _service.ListAsync();
                var myStations = allStations
                    .Where(s => s.OperatorIds != null && s.OperatorIds.Contains(userId))
                    .ToList();

                if (!myStations.Any())
                    return Ok(new { message = "No stations found for this operator", data = new List<object>() });

                var stationIds = myStations.Select(s => s.Id).ToList();
                var allBookings = await _bookingService.GetAllAsync();

                var activeBookings = allBookings
                    .Where(b => stationIds.Contains(b.StationId) && b.Status == BookingStatus.Active)
                    .Select(b => new
                    {
                        _id = b.Id,
                        stationId = b.StationId,
                        ownerNic = b.OwnerNic,
                        reservationAtUtc = b.ReservationAtUtc,
                        createdAtUtc = b.CreatedAtUtc,
                        status = b.Status.ToString()
                    })
                    .OrderBy(b => b.reservationAtUtc)
                    .ToList();

                return Ok(new
                {
                    message = "Active bookings fetched successfully",
                    data = activeBookings,
                    count = activeBookings.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching active bookings",
                    error = ex.Message
                });
            }
        }

        // ==============================================
        // 6. Reservation history (Completed + Cancelled)
        // ==============================================
        [HttpGet("reservation-history")]
        public async Task<IActionResult> GetReservationHistory()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "User ID claim missing." });

                var allStations = await _service.ListAsync();
                var myStationIds = allStations
                    .Where(s => s.OperatorIds != null && s.OperatorIds.Contains(userId))
                    .Select(s => s.Id)
                    .ToList();

                if (!myStationIds.Any())
                    return Ok(new { message = "No stations found for this operator", data = new List<object>(), count = 0 });

                var allBookings = await _bookingService.GetAllAsync();

                var history = allBookings
                    .Where(b => myStationIds.Contains(b.StationId) &&
                        (b.Status == BookingStatus.Completed || b.Status == BookingStatus.Cancelled))
                    .Select(b => new
                    {
                        _id = b.Id,
                        stationId = b.StationId,
                        ownerNic = b.OwnerNic,
                        reservationAtUtc = b.ReservationAtUtc,
                        createdAtUtc = b.CreatedAtUtc,
                        status = b.Status.ToString()
                    })
                    .OrderByDescending(b => b.reservationAtUtc)
                    .ToList();

                return Ok(new
                {
                    message = "Reservation history fetched successfully",
                    data = history,
                    count = history.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching reservation history",
                    error = ex.Message
                });
            }
        }

        // ==============================================
        // 7. Update booking status (Cancelled or Completed)
        // ==============================================
        [HttpPut("booking/{bookingId}/status")]
        public async Task<IActionResult> UpdateBookingStatus(string bookingId, [FromBody] UpdateBookingStatusRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value;

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "User ID claim missing." });

                var booking = await _bookingRepository.GetByIdAsync(bookingId);
                if (booking == null)
                    return NotFound(new { message = "Booking not found." });

                var allStations = await _service.ListAsync();
                var myStationIds = allStations
                    .Where(s => s.OperatorIds != null && s.OperatorIds.Contains(userId))
                    .Select(s => s.Id)
                    .ToList();

                if (!myStationIds.Contains(booking.StationId))
                    return Forbid("You don't have permission to update this booking.");

                if (request.Status != BookingStatus.Cancelled && request.Status != BookingStatus.Completed)
                    return BadRequest(new { message = "Status must be either 'Cancelled' or 'Completed'." });

                var success = await _bookingRepository.UpdateStatusAsync(bookingId, request.Status);
                if (!success)
                    return NotFound(new { message = "Failed to update booking status." });

                return Ok(new
                {
                    message = "Booking status updated successfully",
                    bookingId,
                    status = request.Status.ToString()
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while updating booking status",
                    error = ex.Message
                });
            }
        }

        // ==============================================
        // Record Types
        // ==============================================
        public record UpdateSlotsRequest(int AvailableSlots);
        public record UpdateSlotsOnlyRequest(int AvailableSlots);
        public record UpdateStationRequest(string Location, StationType Type, int AvailableSlots);
        public record UpdateBookingStatusRequest(BookingStatus Status);
    }
}
