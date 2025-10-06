using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: AuthController.cs
//  Created: 2025-10-01
//  Description: Registration and login endpoints issuing JWT tokens.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            // Inline comment at the beginning of method: store service dependency
            _authService = authService;
        }

        public record RegisterRequest(string Email, string Password, UserRole Role);
        public record LoginRequest(string Email, string Password);

        [HttpPost("register")]
        [Authorize(Roles = nameof(UserRole.Backoffice))]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Inline comment at the beginning of method: delegate to service and return created user
            var user = await _authService.RegisterAsync(request.Email, request.Password, request.Role);
            return Created($"api/users/{user.Id}", new { user.Id, user.Email, user.Role });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Inline comment at the beginning of method: authenticate and issue token
            var token = await _authService.LoginAsync(request.Email, request.Password);
            return Ok(new { token });
        }
    }
}


