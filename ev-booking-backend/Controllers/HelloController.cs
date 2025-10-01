using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: HelloController.cs
//  Created: 2025-10-01
//  Description: Simple controller exposing a hello world endpoint.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HelloController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            // Inline comment at the beginning of method: return a static hello world payload
            return Ok(new { message = "Hello, World!" });
        }
    }
}


