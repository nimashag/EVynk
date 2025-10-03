using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    [Authorize(Roles = "Backoffice")]
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
            // Inline comment at the beginning of method: list charging stations
            var stations = await _service.ListAsync();
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
    }
}


