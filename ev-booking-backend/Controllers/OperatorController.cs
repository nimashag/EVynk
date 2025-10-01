using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OperatorController.cs
//  Created: 2025-10-01
//  Description: Sample protected endpoints for Station Operator role.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "StationOperator")]
    public class OperatorController : ControllerBase
    {
        [HttpGet("panel")]
        public IActionResult Panel()
        {
            // Inline comment at the beginning of method: return placeholder operator panel data
            return Ok(new { message = "Station Operator Panel Access Granted" });
        }
    }
}


