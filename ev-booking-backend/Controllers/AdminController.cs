using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: AdminController.cs
//  Created: 2025-10-01
//  Description: Sample protected endpoints for Backoffice role.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Backoffice")]
    public class AdminController : ControllerBase
    {
        [HttpGet("dashboard")]
        public IActionResult Dashboard()
        {
            // Inline comment at the beginning of method: return placeholder admin dashboard data
            return Ok(new { message = "Backoffice Dashboard Access Granted" });
        }
    }
}


