using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly OwnerService _ownerService;

        public AuthController(AuthService authService, OwnerService ownerService)
        {
            _authService = authService;
            _ownerService = ownerService;
        }

        public record RegisterRequest(string Email, string Password, UserRole Role);
        public record LoginRequest(string Email, string Password);

        // Backoffice-only user creation (keep as-is)
        [HttpPost("register")]
        [Authorize(Roles = nameof(UserRole.Backoffice))]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Inline comment at the beginning of method: delegate to service and return created user
            try
            {
                var user = await _authService.RegisterAsync(request.Email, request.Password, request.Role);
                return Created($"api/users/{user.Id}", new { user.Id, user.Email, user.Role });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Allow Station Operators to self-register without admin privileges
        [HttpPost("register/operator")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterOperator([FromBody] LoginRequest request)
        {
            // Inline comment at the beginning of method: self-service signup defaults to StationOperator role
            var user = await _authService.RegisterAsync(request.Email, request.Password, UserRole.StationOperator);
            return Created($"api/users/{user.Id}", new { user.Id, user.Email, Role = user.Role });
            // var user = await _authService.RegisterAsync(request.Email, request.Password, request.Role);
            // return Created($"api/users/{user.Id}", new { user.Id, user.Email, user.Role });
        }

        // Generic login (keep as-is)
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _authService.LoginAsync(request.Email, request.Password);
            return Ok(new { token });
        }

        // ====== NEW for MOBILE ======

        public record RegisterOwnerRequest(string Nic, string FullName, string Email, string Phone, string Password);

        // Public owner self-registration (mobile)
        [HttpPost("register-owner")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterOwner([FromBody] RegisterOwnerRequest request)
        {
            // optional duplicate check by email
            var existing = await _ownerService.FindByEmailAsync(request.Email);
            if (existing is not null) return Conflict(new { message = "Email already registered" });

            // 1) create a login user with role Owner
            await _authService.RegisterAsync(request.Email, request.Password, UserRole.Owner);

            // 2) create owner profile
            var owner = new Owner {
                Nic = request.Nic,
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                IsActive = true
            };
            var created = await _ownerService.CreateAsync(owner);

            // 3) issue JWT for immediate login
            var token = await _authService.LoginAsync(request.Email, request.Password);

            return Created($"api/owners/{created.Nic}", new {
                message = "Owner registered successfully",
                token,
                owner = new {
                    created.Nic,
                    created.FullName,
                    created.Email,
                    created.Phone,
                    created.IsActive
                }
            });
        }

        // Public owner login (mobile)
        [HttpPost("login-owner")]
        [AllowAnonymous]
        public async Task<IActionResult> LoginOwner([FromBody] LoginRequest request)
        {
            var token = await _authService.LoginAsync(request.Email, request.Password);
            var owner = await _ownerService.FindByEmailAsync(request.Email); // method below
            return Ok(new {
                token,
                owner = owner is null ? null : new {
                    owner.Nic,
                    owner.FullName,
                    owner.Email,
                    owner.Phone,
                    owner.IsActive
                }
            });
        }
    }
}
