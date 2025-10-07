#nullable enable
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

//
// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnersController.cs
//  Created: 2025-10-07
//  Description: CRUD + status endpoints for EV Owners (NIC as key).
//               - Anonymous signup for mobile
//               - Backoffice-gated admin operations
//               - DTO mapping and basic password hashing (demo)
//  Author: Student
// ==============================================
//

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/owners")]
    public class OwnersController : ControllerBase
    {
        private readonly OwnerService _service;

        public OwnersController(OwnerService service)
        {
            // capture owner service dependency
            _service = service;
        }

        // -------------------------
        // ANONYMOUS — Mobile signup
        // -------------------------
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateOwnerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid payload", errors = ModelState });

            var owner = OwnerConstants.Create(
                nic: dto.Nic,
                firstName: dto.FirstName,
                lastName: dto.LastName,
                email: dto.Email,
                phone: dto.Phone,
                address: dto.Address,
                vehicle: dto.Vehicle
            );

            // DEMO hashing. Replace with a real hasher (e.g., PBKDF2/BCrypt) in production.
            owner.Auth.PasswordHash = HashSha256(dto.Password ?? string.Empty);

            var created = await _service.CreateAsync(owner);

            return Created($"/api/owners/{created.Nic}", new
            {
                message = "EV owner created successfully",
                nic = created.Nic,
                firstName = created.FirstName,
                lastName = created.LastName,
                email = created.Email,
                phone = created.Phone,
                status = created.Status.ToString()
            });
        }

        // -------------------------
        // BACKOFFICE — Admin ops
        // -------------------------

        [HttpGet]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> List([FromQuery] string? status = null)
        {
            OwnerStatus? filter = null;
            if (!string.IsNullOrWhiteSpace(status))
            {
                if (Enum.TryParse<OwnerStatus>(status, true, out var parsed))
                    filter = parsed;
                else
                    return BadRequest(new { message = "Invalid status. Use Active or Deactivated." });
            }

            var owners = await _service.ListAsync(filter);
            return Ok(new
            {
                message = "EV owners fetched successfully",
                count = owners.Count,
                data = owners
            });
        }

        [HttpGet("{nic}")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> GetOne([FromRoute] string nic)
        {
            var owner = await _service.GetByNicAsync(nic);
            if (owner is null) return NotFound(new { message = "Owner not found", nic });

            return Ok(new
            {
                message = "EV owner fetched successfully",
                data = owner
            });
        }

        [HttpPut("{nic}")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> Update([FromRoute] string nic, [FromBody] UpdateOwnerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid payload", errors = ModelState });

            var updatedOwner = new Owner
            {
                Nic = nic, // service will enforce this
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = (dto.Email ?? string.Empty).Trim().ToLowerInvariant(),
                Phone = dto.Phone ?? string.Empty,
                Address = dto.Address,
                Vehicle = dto.Vehicle,
                Status = dto.Status ?? OwnerStatus.Active, // preserve/override allowed at admin level
                // Auth stays as-is unless you implement a password reset flow separately
            };

            var ok = await _service.UpdateAsync(nic, updatedOwner);
            if (!ok) return NotFound(new { message = "Owner not found", nic });

            return Ok(new
            {
                message = "EV owner updated successfully",
                nic,
                firstName = updatedOwner.FirstName,
                lastName = updatedOwner.LastName,
                email = updatedOwner.Email,
                phone = updatedOwner.Phone,
                status = updatedOwner.Status.ToString()
            });
        }

        [HttpDelete("{nic}")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> Delete([FromRoute] string nic)
        {
            var ok = await _service.DeleteAsync(nic);
            if (!ok) return NotFound(new { message = "Owner not found", nic });

            return Ok(new { message = "EV owner deleted successfully", nic });
        }

        [HttpPatch("{nic}/status")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> PatchStatus([FromRoute] string nic, [FromBody] PatchOwnerStatusDto dto)
        {
            if (!Enum.IsDefined(typeof(OwnerStatus), dto.Status))
                return BadRequest(new { message = "Invalid status. Use Active or Deactivated." });

            var actor = User?.Identity?.Name ?? "backoffice";
            var ok = await _service.SetStatusByBackofficeAsync(nic, dto.Status, actor);
            if (!ok) return NotFound(new { message = "Owner not found", nic });

            return Ok(new
            {
                message = "Owner status updated successfully",
                nic,
                status = dto.Status.ToString()
            });
        }

        // -------------------------
        // Helpers
        // -------------------------
        private static string HashSha256(string input)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            return BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
        }
    }

    // =========================
    // DTOs (keep in same file or move to /Models/DTOs)
    // =========================
    public class CreateOwnerDto
    {
        public string Nic { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public Address? Address { get; set; }
        public Vehicle? Vehicle { get; set; }
        public string? Password { get; set; }
    }

    public class UpdateOwnerDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public Address? Address { get; set; }
        public Vehicle? Vehicle { get; set; }
        public OwnerStatus? Status { get; set; } // admin-only control
    }

    public class PatchOwnerStatusDto
    {
        public OwnerStatus Status { get; set; }
        public string? Reason { get; set; } // optional
    }
}
