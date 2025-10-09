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
        private readonly IEmailService _emailService;

        public AuthController(AuthService authService, OwnerService ownerService, IEmailService emailService)
        {
            _authService = authService;
            _ownerService = ownerService;
            _emailService = emailService;
        }

        public record RegisterRequest(string Name, string Email, string PhoneNumber, string Password, UserRole Role);
        public record LoginRequest(string Email, string Password);

        // Backoffice-only user creation (keep as-is)
        [HttpPost("register")]
        [Authorize(Roles = nameof(UserRole.Backoffice))]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Inline comment at the beginning of method: delegate to service and return created user
            try
            {
                var user = await _authService.RegisterAsync(request.Email, request.Password, request.Role, request.Name, request.PhoneNumber);
                
                // Send email with credentials if creating a Station Operator
                if (request.Role == UserRole.StationOperator)
                {
                    try
                    {
                        await _emailService.SendOperatorCredentialsAsync(request.Email, request.Email, request.Password);
                    }
                    catch (Exception emailEx)
                    {
                        Console.WriteLine($"Failed to send email to {request.Email}: {emailEx.Message}");
                    }
                }
                
                return Created($"api/users/{user.Id}", new { user.Id, user.Name, user.Email, user.PhoneNumber, user.Role });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        public record RegisterOperatorRequest(string Name, string Email, string PhoneNumber, string Password);

        // Allow Station Operators to self-register without admin privileges
        [HttpPost("register/operator")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterOperator([FromBody] RegisterOperatorRequest request)
        {
            // Inline comment at the beginning of method: self-service signup defaults to StationOperator role
            var user = await _authService.RegisterAsync(request.Email, request.Password, UserRole.StationOperator, request.Name, request.PhoneNumber);
            return Created($"api/users/{user.Id}", new { user.Id, user.Name, user.Email, user.PhoneNumber, Role = user.Role });
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

        // Test endpoint for email functionality (remove in production)
        [HttpPost("test-email")]
        [Authorize(Roles = nameof(UserRole.Backoffice))]
        public async Task<IActionResult> TestEmail([FromBody] LoginRequest request)
        {
            try
            {
                await _emailService.SendOperatorCredentialsAsync(request.Email, request.Email, request.Password);
                return Ok(new { message = "Test email sent successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to send test email: {ex.Message}" });
            }
        }
    }
}
