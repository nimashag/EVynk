using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: AuthService.cs
//  Created: 2025-10-01
//  Description: Handles registration, login, password hashing, JWT issuing.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Services
{
    public class JwtSettings
    {
        public const string SectionName = "Jwt";
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public string Secret { get; set; } = string.Empty;
        public int ExpiryMinutes { get; set; } = 60;
    }

    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtSettings _jwtSettings;

        public AuthService(IUserRepository userRepository, IOptions<JwtSettings> jwtOptions)
        {
            // Inline comment at the beginning of method: assign collaborators and settings
            _userRepository = userRepository;
            _jwtSettings = jwtOptions.Value;
        }

        public async Task<User> RegisterAsync(string email, string password, UserRole role, string name = "", string phoneNumber = "")
        {
            // Inline comment at the beginning of method: check existence, hash password, create user
            var existing = await _userRepository.FindByEmailAsync(email);
            if (existing != null) throw new InvalidOperationException("User already exists");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User 
            { 
                Name = name,
                Email = email, 
                PhoneNumber = phoneNumber,
                PasswordHash = passwordHash, 
                Role = role 
            };
            return await _userRepository.CreateAsync(user);
        }

        public async Task<string> LoginAsync(string email, string password)
        {
            // Inline comment at the beginning of method: validate password and issue JWT
            var user = await _userRepository.FindByEmailAsync(email) ?? throw new UnauthorizedAccessException("Invalid credentials");
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) throw new UnauthorizedAccessException("Invalid credentials");

            return GenerateJwt(user);
        }

        private string GenerateJwt(User user)
        {
            // Inline comment at the beginning of method: create token with role claim
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
    }
}


