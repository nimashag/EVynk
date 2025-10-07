#nullable enable
using System;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;

//
// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnerAuthController.cs
//  Created: 2025-10-07
//  Description: Authentication endpoints for EV Owners (mobile).
//               Uses NIC + password and issues JWT tokens.
//  Author: Student
// ==============================================
//

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/owner-auth")]
    public class OwnerAuthController : ControllerBase
    {
        private readonly IOwnerRepository _owners;
        private readonly IConfiguration _config;

        public OwnerAuthController(IOwnerRepository owners, IConfiguration config)
        {
            // capture dependencies (Mongo repository + configuration for JWT)
            _owners = owners;
            _config = config;
        }

        // --------------------------------------------------------------------
        // Request model (mobile login)
        // --------------------------------------------------------------------
        public record OwnerLoginRequest(string Nic, string Password);

        // --------------------------------------------------------------------
        // POST /api/owner-auth/login
        // --------------------------------------------------------------------
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] OwnerLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Nic) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "NIC and password are required." });

            // find owner by NIC
            var owner = await _owners.GetByNicAsync(request.Nic);
            if (owner is null)
                return Unauthorized(new { message = "Invalid NIC or password." });

            // status check
            if (owner.Status == OwnerStatus.Deactivated)
                return Unauthorized(new { message = "Account is deactivated. Contact backoffice to reactivate." });

            // verify password (demo SHA256; replace with PBKDF2 or BCrypt for production)
            var hashedInput = HashSha256(request.Password);
            if (!string.Equals(owner.Auth.PasswordHash, hashedInput, StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new { message = "Invalid NIC or password." });

            // update last login time
            owner.Auth.LastLoginAt = DateTime.UtcNow;
            await _owners.UpdateAsync(owner.Nic, owner);

            // issue JWT token
            var token = GenerateJwtForOwner(owner);

            return Ok(new
            {
                message = "Login successful",
                token,
                nic = owner.Nic,
                firstName = owner.FirstName,
                lastName = owner.LastName,
                email = owner.Email
            });
        }

        // --------------------------------------------------------------------
        // Helper: Build JWT for Owner
        // --------------------------------------------------------------------
        private string GenerateJwtForOwner(Owner owner)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new Exception("JWT key missing"));
            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var expiryMinutes = int.TryParse(_config["Jwt:ExpiryMinutes"], out var mins) ? mins : 120;
            var expiry = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, owner.Nic),
                new Claim("nic", owner.Nic),
                new Claim(ClaimTypes.Role, "Owner"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // --------------------------------------------------------------------
        // Helper: Hash password with SHA-256 (for demo/testing)
        // --------------------------------------------------------------------
        private static string HashSha256(string input)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            return BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
        }
    }
}
