#nullable enable
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

//
// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: MeController.cs
//  Created: 2025-10-07
//  Description: Mobile self endpoints for EV Owner:
//               - GET  /api/me
//               - PUT  /api/me
//               - PATCH /api/me/status  (self-deactivate only)
//  Author: Student
// ==============================================
//

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/me")]
    [Authorize] // mobile tokens required; role not enforced here, we key strictly off NIC claim
    public class MeController : ControllerBase
    {
        private readonly OwnerService _service;

        public MeController(OwnerService service)
        {
            _service = service;
        }

        // -------------------------
        // GET /api/me
        // -------------------------
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var nic = GetNicFromClaims();
            if (nic is null)
                return Unauthorized(new { message = "NIC claim not found in token." });

            var owner = await _service.GetByNicAsync(nic);
            if (owner is null)
                return NotFound(new { message = "Owner not found", nic });

            return Ok(new
            {
                message = "Profile fetched successfully",
                data = owner
            });
        }

        // -------------------------
        // PUT /api/me
        // -------------------------
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateMeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid payload", errors = ModelState });

            var nic = GetNicFromClaims();
            if (nic is null)
                return Unauthorized(new { message = "NIC claim not found in token." });

            var existing = await _service.GetByNicAsync(nic);
            if (existing is null)
                return NotFound(new { message = "Owner not found", nic });

            // Apply allowed self-updatable fields only
            existing.FirstName = dto.FirstName?.Trim() ?? existing.FirstName;
            existing.LastName  = dto.LastName?.Trim()  ?? existing.LastName;
            if (!string.IsNullOrWhiteSpace(dto.Email))
                existing.Email = dto.Email!.Trim().ToLowerInvariant();
            if (!string.IsNullOrWhiteSpace(dto.Phone))
                existing.Phone = dto.Phone!.Trim();
            if (dto.Address is not null) existing.Address = dto.Address;
            if (dto.Vehicle is not null) existing.Vehicle = dto.Vehicle;

            var ok = await _service.UpdateAsync(nic, existing);
            if (!ok) return NotFound(new { message = "Owner not found on update", nic });

            return Ok(new
            {
                message = "Profile updated successfully",
                nic,
                firstName = existing.FirstName,
                lastName = existing.LastName,
                email = existing.Email,
                phone = existing.Phone
            });
        }

        // --------------------------------------------
        // PATCH /api/me/status   (Self-deactivate only)
        // --------------------------------------------
        [HttpPatch("status")]
        public async Task<IActionResult> PatchMyStatus([FromBody] PatchMyStatusDto dto)
        {
            var nic = GetNicFromClaims();
            if (nic is null)
                return Unauthorized(new { message = "NIC claim not found in token." });

            // Self can only move to Deactivated. Reactivation is backoffice-only.
            if (dto.Status != OwnerStatus.Deactivated)
                return BadRequest(new { message = "Only self-deactivation is allowed. Contact support to reactivate." });

            var ok = await _service.DeactivateSelfAsync(nic);
            if (!ok) return NotFound(new { message = "Owner not found", nic });

            return Ok(new
            {
                message = "Account deactivated successfully",
                nic,
                status = OwnerStatus.Deactivated.ToString()
            });
        }

        // -------------------------
        // Helpers
        // -------------------------
        private string? GetNicFromClaims()
        {
            // Preferred custom claim
            var nic = User.FindFirstValue("nic");
            if (!string.IsNullOrWhiteSpace(nic)) return nic;

            // Common fallbacks
            nic = User.FindFirstValue(ClaimTypes.NameIdentifier); // "nameidentifier"
            if (!string.IsNullOrWhiteSpace(nic)) return nic;

            nic = User.FindFirstValue("sub"); // OpenID sub
            return string.IsNullOrWhiteSpace(nic) ? null : nic;
        }
    }

    // =========================
    // DTOs (self variants)
    // =========================
    public class UpdateMeDto
    {
        public string? FirstName { get; set; }
        public string? LastName  { get; set; }
        public string? Email     { get; set; }
        public string? Phone     { get; set; }
        public Address? Address  { get; set; }
        public Vehicle? Vehicle  { get; set; }
        // No Status field here (self cannot reactivate)
        // No password change here; do a separate /api/auth/change-password if needed
    }

    public class PatchMyStatusDto
    {
        public OwnerStatus Status { get; set; }
        public string? Reason { get; set; } // optional ("user_request")
    }
}
