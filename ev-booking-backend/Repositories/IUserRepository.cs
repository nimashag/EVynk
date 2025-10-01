using EVynk.Booking.Api.Models;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: IUserRepository.cs
//  Created: 2025-10-01
//  Description: Abstraction for user data access.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Repositories
{
    public interface IUserRepository
    {
        // Inline comment at the beginning of method: create a new user document
        Task<User> CreateAsync(User user);

        // Inline comment at the beginning of method: find a user by email
        Task<User?> FindByEmailAsync(string email);
    }
}


