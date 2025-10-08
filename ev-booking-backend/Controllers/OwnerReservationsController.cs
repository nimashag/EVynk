using System.Security.Claims;
using EVynk.Booking.Api.Dtos;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnerReservationsController.cs
//  Created: 2025-10-08
//  Description: EV Owner self-service CRUD for reservations.
//               Enforces 7-day window and ≥12-hour rules via service.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/owner/reservations")]
    [Authorize(Roles = nameof(UserRole.Owner))] // only authenticated Owners
    public class OwnerReservationsController : ControllerBase
    {
        private readonly OwnerReservationService _service;
        private readonly OwnerService _owners;

        public OwnerReservationsController(OwnerReservationService service, OwnerService owners)
        {
            // Inline: DI of services
            _service = service;
            _owners = owners;
        }

        // Helper: resolve current Owner's NIC via token email
        private async Task<string?> CurrentOwnerNicAsync()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.Identity?.Name;
            if (string.IsNullOrWhiteSpace(email)) return null;
            var owner = await _owners.FindByEmailAsync(email);
            return owner?.Nic;
        }

        // POST /api/owner/reservations
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOwnerReservationRequest req)
        {
            // Inline: create reservation for logged-in owner
            var nic = await CurrentOwnerNicAsync();
            if (string.IsNullOrWhiteSpace(nic))
                return Unauthorized(new { message = "Owner identity not resolved from token." });

            try
            {
                var created = await _service.CreateAsync(nic, req.StationId, req.ReservationAt);
                return Created($"api/owner/reservations/{created.Id}", new
                {
                    message = "Reservation created successfully",
                    data = created
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // GET /api/owner/reservations/upcoming
        [HttpGet("upcoming")]
        public async Task<IActionResult> Upcoming()
        {
            var nic = await CurrentOwnerNicAsync();
            if (string.IsNullOrWhiteSpace(nic))
                return Unauthorized(new { message = "Owner identity not resolved from token." });

            try
            {
                var data = await _service.GetUpcomingAsync(nic);
                return Ok(new { message = "Upcoming reservations fetched successfully", data });
            }
            catch (Exception ex)
            {
                // 🔧 Return useful info during dev (you can log instead in production)
                return StatusCode(500, new { message = "Failed to fetch upcoming reservations", error = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> History()
        {
            var nic = await CurrentOwnerNicAsync();
            if (string.IsNullOrWhiteSpace(nic))
                return Unauthorized(new { message = "Owner identity not resolved from token." });

            try
            {
                var data = await _service.GetHistoryAsync(nic);
                return Ok(new { message = "Past reservations fetched successfully", data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch past reservations", error = ex.Message });
            }
        }


        // GET /api/owner/reservations/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] string id)
        {
            // Inline: fetch a single reservation if it belongs to the owner
            var nic = await CurrentOwnerNicAsync();
            if (string.IsNullOrWhiteSpace(nic))
                return Unauthorized(new { message = "Owner identity not resolved from token." });

            var data = await _service.GetByIdForOwnerAsync(id, nic);
            if (data is null) return NotFound(new { message = "Reservation not found." });

            return Ok(new { message = "Reservation fetched successfully", data });
        }

        // PUT /api/owner/reservations/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateOwnerReservationRequest req)
        {
            // Inline: owner-initiated update with ≥12-hour cutoff
            var nic = await CurrentOwnerNicAsync();
            if (string.IsNullOrWhiteSpace(nic))
                return Unauthorized(new { message = "Owner identity not resolved from token." });

            try
            {
                var ok = await _service.UpdateAsync(id, nic, req.StationId, req.ReservationAt);
                if (!ok) return NotFound(new { message = "Reservation not found." });

                var data = await _service.GetByIdForOwnerAsync(id, nic);
                return Ok(new { message = "Reservation updated successfully", data });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // DELETE /api/owner/reservations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel([FromRoute] string id)
        {
            // Inline: owner-initiated cancel with ≥12-hour cutoff
            var nic = await CurrentOwnerNicAsync();
            if (string.IsNullOrWhiteSpace(nic))
                return Unauthorized(new { message = "Owner identity not resolved from token." });

            try
            {
                var ok = await _service.CancelAsync(id, nic);
                if (!ok) return NotFound(new { message = "Reservation not found." });
                return Ok(new { message = "Reservation cancelled successfully", id, status = BookingStatus.Cancelled.ToString() });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}
