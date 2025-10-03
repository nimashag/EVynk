using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnersController.cs
//  Created: 2025-10-01
//  Description: CRUD endpoints for EV Owners using NIC as key.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Backoffice")]
    public class OwnersController : ControllerBase
    {
        private readonly OwnerService _service;

        public OwnersController(OwnerService service)
        {
            // Inline comment at the beginning of method: inject owner service
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> List()
        {
            // Inline comment at the beginning of method: return all owners with message
            var owners = await _service.ListAsync();
            return Ok(new
            {
                message = "EV owners fetched successfully",
                data = owners
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Owner owner)
        {
            // Inline comment at the beginning of method: create owner
            var created = await _service.CreateAsync(owner);
            return Created($"api/owners/{created.Nic}", new
            {
                message = "EV owner created successfully",
                nic = created.Nic,
                fullName = created.FullName,
                email = created.Email,
                phone = created.Phone
            });
        }

        [HttpPut("{nic}")]
        public async Task<IActionResult> Update([FromRoute] string nic, [FromBody] Owner owner)
        {
            // Inline comment at the beginning of method: update owner by NIC
            var updated = await _service.UpdateAsync(nic, owner);
            if (!updated) return NotFound();
            return Ok(new
            {
                message = "EV owner updated successfully",
                nic = nic,
                fullName = owner.FullName,
                email = owner.Email,
                phone = owner.Phone
            });
        }

        [HttpDelete("{nic}")]
        public async Task<IActionResult> Delete([FromRoute] string nic)
        {
            // Inline comment at the beginning of method: delete owner by NIC
            var deleted = await _service.DeleteAsync(nic);
            if (!deleted) return NotFound();
            return Ok(new
            {
                message = "EV owner deleted successfully",
                nic = nic
            });
        }

        [HttpPut("{nic}/activate")]
        public async Task<IActionResult> Activate([FromRoute] string nic)
        {
            // Inline comment at the beginning of method: activate owner account
            var ok = await _service.ActivateAsync(nic);
            if (!ok) return NotFound();
            return Ok(new { message = "EV owner activated successfully", nic = nic, isActive = true });
        }

        [HttpPut("{nic}/deactivate")]
        public async Task<IActionResult> Deactivate([FromRoute] string nic)
        {
            // Inline comment at the beginning of method: deactivate owner account
            var ok = await _service.DeactivateAsync(nic);
            if (!ok) return NotFound();
            return Ok(new { message = "EV owner deactivated successfully", nic = nic, isActive = false });
        }
    }
}


