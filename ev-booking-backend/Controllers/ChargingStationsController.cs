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
    }
}


