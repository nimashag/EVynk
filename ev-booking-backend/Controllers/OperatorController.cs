using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EVynk.Booking.Api.Services; 

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OperatorController.cs
//  Created: 2025-10-01
//  Description: Sample protected endpoints for Station Operator role.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "StationOperator")]
    public class OperatorController : ControllerBase
    {
        private readonly ChargingStationService _chargingStationService;
        private readonly BookingService _bookingService;

        public OperatorController(ChargingStationService chargingStationService, BookingService bookingService)
        {
            _chargingStationService = chargingStationService;
            _bookingService = bookingService;
        }

        [HttpGet("panel")]
        public IActionResult Panel()
        {
            // Inline comment at the beginning of method: return placeholder operator panel data
            return Ok(new { message = "Station Operator Panel Access Granted" });
        }

        [HttpGet("station")]
        public async Task<IActionResult> GetAssignedStations()
        {
            var operatorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(operatorId))
                return Unauthorized();

            var stations = await _chargingStationService.GetStationsByOperatorIdAsync(operatorId);
            return Ok(stations);
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetBookingsForOperator()
        {
            var operatorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(operatorId))
                return Unauthorized();

            var stations = await _chargingStationService.GetStationsByOperatorIdAsync(operatorId);
            var stationIds = stations.Select(s => s.Id).ToList();

            var bookings = await _bookingService.GetBookingsByStationIdsAsync(stationIds);

            return Ok(new
            {
                message = "Operator bookings fetched successfully",
                stations = stations.Select(s => new { s.Id, s.Location }),
                bookings
            });
        }
        
    }
}