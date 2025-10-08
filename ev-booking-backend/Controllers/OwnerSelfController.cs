using System.Security.Claims;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnerSelfController.cs
//  Created: 2025-10-07
//  Description: Self-service endpoints for EV Owners.
//               Owners can view/update profile, deactivate,
//               create/modify/cancel their reservations,
//               and list their own reservations.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/owner")]
    [Authorize(Roles = nameof(UserRole.Owner))] // only authenticated Owners
    public class OwnerSelfController : ControllerBase
    {
        private readonly OwnerService _owners;
        private readonly BookingService _bookings;

        public OwnerSelfController(OwnerService owners, BookingService bookings)
        {
            _owners   = owners;
            _bookings = bookings;
        }

        // helper: get current user's email from JWT
        private string? CurrentEmail =>
            User.FindFirst(ClaimTypes.Email)?.Value ?? User.Identity?.Name;

        // -------------------- Profile --------------------

        // GET /api/owner/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var email = CurrentEmail;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { message = "Email claim missing." });

            var owner = await _owners.FindByEmailAsync(email);
            if (owner is null) return NotFound(new { message = "Owner profile not found." });

            return Ok(new
            {
                message = "Owner profile fetched successfully",
                owner = new
                {
                    owner.Nic,
                    owner.FullName,
                    owner.Email,
                    owner.Phone,
                    owner.IsActive
                }
            });
        }

        public record UpdateMeRequest(string? FullName, string? Phone);

        // PUT /api/owner/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateMeRequest req)
        {
            var email = CurrentEmail;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { message = "Email claim missing." });

            var owner = await _owners.FindByEmailAsync(email);
            if (owner is null) return NotFound(new { message = "Owner profile not found." });

            if (!string.IsNullOrWhiteSpace(req.FullName)) owner.FullName = req.FullName!;
            if (!string.IsNullOrWhiteSpace(req.Phone))    owner.Phone    = req.Phone!;

            var ok = await _owners.UpdateAsync(owner.Nic, owner);
            if (!ok) return StatusCode(500, new { message = "Owner update failed." });

            return Ok(new
            {
                message = "Owner updated successfully",
                owner = new { owner.Nic, owner.FullName, owner.Email, owner.Phone, owner.IsActive }
            });
        }

        // PUT /api/owner/me/deactivate
        [HttpPut("me/deactivate")]
        public async Task<IActionResult> DeactivateMe()
        {
            var email = CurrentEmail;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { message = "Email claim missing." });

            var owner = await _owners.FindByEmailAsync(email);
            if (owner is null) return NotFound(new { message = "Owner profile not found." });

            var ok = await _owners.DeactivateAsync(owner.Nic);
            if (!ok) return StatusCode(500, new { message = "Deactivation failed." });

            return Ok(new { message = "EV owner deactivated successfully", nic = owner.Nic, isActive = false });
        }

        // -------------------- Reservations (Owner) --------------------

        public record CreateReservationRequest(string StationId, DateTime ReservationAt);

        // POST /api/owner/reservations
        [HttpPost("reservations")]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
        {
            var email = CurrentEmail;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { message = "Email claim missing." });
            var owner = await _owners.FindByEmailAsync(email);
            if (owner is null) return NotFound(new { message = "Owner profile not found." });

            try
            {
                var created = await _bookings.CreateOwnerReservationAsync(
                    stationId: request.StationId,
                    ownerNic: owner.Nic,
                    reservationAtLocal: request.ReservationAt
                );

                // summary style payload
                return Created($"api/bookings/{created.Id}", new
                {
                    message = "Reservation created successfully",
                    summary = new
                    {
                        created.Id,
                        created.StationId,
                        created.OwnerNic,
                        reservationAtUtc = created.ReservationAtUtc,
                        status = created.Status.ToString(),
                        created.CreatedAtUtc
                    }
                });
            }
            catch (ArgumentException ex)      { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex){ return Conflict(new { message = ex.Message }); }
        }

        // GET /api/owner/reservations
        [HttpGet("reservations")]
        public async Task<IActionResult> GetMyReservations()
        {
            var email = CurrentEmail;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { message = "Email claim missing." });
            var owner = await _owners.FindByEmailAsync(email);
            if (owner is null) return NotFound(new { message = "Owner profile not found." });

            var bookings = await _bookings.GetByOwnerAsync(owner.Nic);

            return Ok(new
            {
                message = "Your bookings fetched successfully",
                count = bookings.Count(),
                data = bookings.Select(b => new
                {
                    b.Id,
                    b.StationId,
                    b.OwnerNic,
                    b.ReservationAtUtc,
                    status = b.Status.ToString(),
                    b.CreatedAtUtc
                })
            });
        }

        public record ModifyReservationRequest(string StationId, DateTime ReservationAt);

        // PUT /api/owner/reservations/{id}
        [HttpPut("reservations/{id}")]
        public async Task<IActionResult> ModifyReservation([FromRoute] string id, [FromBody] ModifyReservationRequest req)
        {
            var email = CurrentEmail;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { message = "Email claim missing." });
            var owner = await _owners.FindByEmailAsync(email);
            if (owner is null) return NotFound(new { message = "Owner profile not found." });

            try
            {
                var modified = await _bookings.UpdateByOwnerAsync(
                    id: id,
                    ownerNic: owner.Nic,
                    stationId: req.StationId,
                    reservationAtLocal: req.ReservationAt
                );

                if (modified is null) return NotFound(new { message = "Booking not found." });

                return Ok(new
                {
                    message = "Reservation updated successfully",
                    summary = new
                    {
                        modified.Id,
                        modified.StationId,
                        modified.OwnerNic,
                        reservationAtUtc = modified.ReservationAtUtc,
                        status = modified.Status.ToString(),
                        modified.CreatedAtUtc
                    }
                });
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (ArgumentException ex)           { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex)    { return Conflict(new { message = ex.Message }); }
        }

        // DELETE /api/owner/reservations/{id}
        [HttpDelete("reservations/{id}")]
        public async Task<IActionResult> CancelReservation([FromRoute] string id)
        {
            var email = CurrentEmail;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { message = "Email claim missing." });
            var owner = await _owners.FindByEmailAsync(email);
            if (owner is null) return NotFound(new { message = "Owner profile not found." });

            try
            {
                var cancelled = await _bookings.CancelByOwnerAsync(id, owner.Nic);
                if (!cancelled) return NotFound(new { message = "Booking not found." });

                return Ok(new { message = "Reservation cancelled successfully", id, status = "Cancelled" });
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (InvalidOperationException ex)    { return Conflict(new { message = ex.Message }); }
        }
    }
}
