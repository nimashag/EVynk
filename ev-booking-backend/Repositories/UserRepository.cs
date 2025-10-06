using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Persistence;
using MongoDB.Driver;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: UserRepository.cs
//  Created: 2025-10-01
//  Description: MongoDB-backed user repository implementation.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IMongoCollection<User> _users;

        public UserRepository(MongoDbContext context)
        {
            // Inline comment at the beginning of method: initialize collection handle
            _users = context.Database.GetCollection<User>("users");
        }

        public async Task<User> CreateAsync(User user)
        {
            // Inline comment at the beginning of method: insert user document
            await _users.InsertOneAsync(user);
            return user;
        }

        public async Task<User?> FindByEmailAsync(string email)
        {
            // Inline comment at the beginning of method: filter by email
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task<List<User>> GetByRoleAsync(UserRole role)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Role, role);
            return await _users.Find(filter).ToListAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

    }
}


