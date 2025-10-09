using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: ChargingStationsController.cs
//  Created: 2025-10-01
//  Description: Backoffice endpoints for managing charging stations.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Backoffice,StationOperator")]
    public class ChargingStationsController : ControllerBase
    {
        private readonly ChargingStationService _service;

        public ChargingStationsController(ChargingStationService service)
        {
            // Inline comment at the beginning of method: inject station service
            _service = service;
        }

       [HttpGet]
        public async Task<IActionResult> List()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId   = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var stations = await _service.ListAsync();

            if (userRole == UserRole.StationOperator.ToString())
            {
                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized(new { message = "User id claim missing." });

                stations = stations
                    .Where(s => s.OperatorIds != null && s.OperatorIds.Contains(userId))
                    .ToList();
            }

            return Ok(new { message = "Charging stations fetched successfully", data = stations });
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ChargingStation station)
        {
            // Inline comment at the beginning of method: create station and return response
            var created = await _service.CreateAsync(station);
            return Created($"api/chargingstations/{created.Id}", new
            {
                message = "Charging station created successfully",
                id = created.Id,
                location = created.Location,
                type = created.Type.ToString(),
                availableSlots = created.AvailableSlots
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] ChargingStation station)
        {
            // Inline comment at the beginning of method: update station details
            var ok = await _service.UpdateAsync(id, station);
            if (!ok) return NotFound();
            return Ok(new
            {
                message = "Charging station updated successfully",
                id = id,
                location = station.Location,
                type = station.Type.ToString(),
                availableSlots = station.AvailableSlots
            });
        }

        public record UpdateSlotsRequest(int AvailableSlots);

        [HttpPut("{id}/slots")]
        public async Task<IActionResult> UpdateSlots([FromRoute] string id, [FromBody] UpdateSlotsRequest body)
        {
            // Inline comment at the beginning of method: update availability of slots
            var ok = await _service.SetAvailableSlotsAsync(id, body.AvailableSlots);
            if (!ok) return NotFound();
            return Ok(new { message = "Charging station slots updated successfully", id = id, availableSlots = body.AvailableSlots });
        }

        public record SetActiveRequest(bool IsActive);

        [HttpPatch("{id}/active")]
        public async Task<IActionResult> SetActive([FromRoute] string id, [FromBody] SetActiveRequest body)
        {
            // Inline comment at the beginning of method: set active flag with guard against active bookings
            try
            {
                var ok = await _service.SetActiveAsync(id, body.IsActive);
                if (!ok) return NotFound();
                return Ok(new { 
                    message = body.IsActive ? "Charging station activated successfully" : "Charging station deactivated successfully", 
                    id = id, 
                    isActive = body.IsActive 
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] string id)
        {
            // Inline comment at the beginning of method: hard delete if no active bookings
            try
            {
                var ok = await _service.DeleteAsync(id);
                if (!ok) return NotFound();
                return Ok(new { message = "Charging station deleted successfully", id = id });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

       [HttpGet("station")]
public async Task<IActionResult> GetAssignedStations()
{
    var operatorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(operatorId))
        return Unauthorized();

    var stations = await _service.GetStationsByOperatorIdAsync(operatorId);
    return Ok(stations);
}


    }
}


