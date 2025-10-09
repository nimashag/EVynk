using EVynk.Booking.Api.Dtos;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OperatorReservationsController.cs
//  Created: 2025-10-08
//  Description: Station Operator endpoints to verify a scanned QR payload
//               and complete an active charging session.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/operator/reservations")]
    [Authorize(Roles = nameof(UserRole.StationOperator))] // only Station Operators
    public class OperatorReservationsController : ControllerBase
    {
        private readonly OperatorReservationService _service;

        public OperatorReservationsController(OperatorReservationService service)
        {
            // Inline: capture service dependency
            _service = service;
        }

        // POST /api/operator/reservations/verify
        // Inline: verify that the scanned QR payload matches server-side booking data
        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] OperatorVerifyRequest req)
        {
            try
            {
                var res = await _service.VerifyAsync(req);
                return Ok(new { message = "Verified", data = res });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
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

        // PATCH /api/operator/reservations/{id}/complete
        // Inline: finalize an Active booking -> Completed
        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> Complete([FromRoute] string id)
        {
            try
            {
                var ok = await _service.CompleteAsync(id);
                if (!ok) return StatusCode(500, new { message = "Failed to update booking." });
                return Ok(new { message = "Charging session completed.", id, status = "Completed" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
