using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Backoffice")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _repository;

        public UsersController(IUserRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("operators")]
        public async Task<IActionResult> GetOperators()
        {
            var operators = await _repository.GetByRoleAsync(UserRole.StationOperator);
            var data = operators.Select(u => new { id = u.Id, email = u.Email });
            return Ok(new { message = "Operators fetched successfully", data });
        }

        [HttpGet("by-email/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            var user = await _repository.GetByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new { id = user.Id, email = user.Email, role = user.Role.ToString() });
        }
    }
}