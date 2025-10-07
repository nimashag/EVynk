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
//               Owners can view/update their own profile and deactivate themselves.
//               Reactivation remains Backoffice-only (per assignment rules).
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

        public OwnerSelfController(OwnerService owners)
        {
            // Inline: capture service dependency
            _owners = owners;
        }

        // Small helper: get current user's email from JWT
        private string? CurrentEmail =>
            User.FindFirst(ClaimTypes.Email)?.Value ?? User.Identity?.Name;

        // GET /api/owner/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            // Inline: resolve owner by token email
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

        public record UpdateMeRequest(string? FullName, string? Phone /*, string? Email */);

        // PUT /api/owner/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateMeRequest req)
        {
            var email = CurrentEmail;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { message = "Email claim missing." });

            var owner = await _owners.FindByEmailAsync(email);
            if (owner is null) return NotFound(new { message = "Owner profile not found." });

            // Inline: apply only provided fields
            if (!string.IsNullOrWhiteSpace(req.FullName)) owner.FullName = req.FullName!;
            if (!string.IsNullOrWhiteSpace(req.Phone))    owner.Phone    = req.Phone!;

            // NOTE: If you want to allow changing email, also update the User account.
            // That requires an AuthService.UpdateEmailAsync(...) – omitted to keep scope clear.

            var ok = await _owners.UpdateAsync(owner.Nic, owner);
            if (!ok) return StatusCode(500, new { message = "Owner update failed." });

            return Ok(new
            {
                message = "Owner updated successfully",
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

            // Optional: you could also invalidate active refresh tokens here.

            return Ok(new
            {
                message = "EV owner deactivated successfully",
                nic = owner.Nic,
                isActive = false
            });
        }
    }
}
