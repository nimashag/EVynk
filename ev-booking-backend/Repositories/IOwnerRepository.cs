using EVynk.Booking.Api.Models;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: IOwnerRepository.cs
//  Created: 2025-10-01
//  Description: Abstraction for EV owner data access with NIC as key.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Repositories
{
    public interface IOwnerRepository
    {
        // Inline comment at the beginning of method: create a new owner document
        Task<Owner> CreateAsync(Owner owner);

        // Inline comment at the beginning of method: update existing owner by NIC
        Task<bool> UpdateAsync(string nic, Owner owner);

        // Inline comment at the beginning of method: delete owner by NIC
        Task<bool> DeleteAsync(string nic);

        // Inline comment at the beginning of method: get owner by NIC
        Task<Owner?> GetByNicAsync(string nic);

        // Inline comment at the beginning of method: list all owners
        Task<List<Owner>> ListAsync();

        // Inline comment at the beginning of method: set active status for owner by NIC
        Task<bool> SetActiveAsync(string nic, bool isActive);

        
        Task<Owner?> FindByEmailAsync(string email);
    }
}


