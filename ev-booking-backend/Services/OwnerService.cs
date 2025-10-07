using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnerService.cs
//  Created: 2025-10-01
//  Description: Business logic for EV Owner operations.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Services
{
    public class OwnerService
    {
        private readonly IOwnerRepository _repository;

        public OwnerService(IOwnerRepository repository)
        {
            // Inline comment at the beginning of method: capture repository dependency
            _repository = repository;
        }

        public async Task<Owner> CreateAsync(Owner owner)
        {
            // Inline comment at the beginning of method: validate and delegate to repository
            if (string.IsNullOrWhiteSpace(owner.Nic)) throw new ArgumentException("NIC is required");
            return await _repository.CreateAsync(owner);
        }

        public async Task<bool> UpdateAsync(string nic, Owner owner)
        {
            // Inline comment at the beginning of method: ensure target NIC provided
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required");
            return await _repository.UpdateAsync(nic, owner);
        }

        public async Task<bool> DeleteAsync(string nic)
        {
            // Inline comment at the beginning of method: delete by NIC
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required");
            return await _repository.DeleteAsync(nic);
        }

        public async Task<List<Owner>> ListAsync()
        {
            // Inline comment at the beginning of method: retrieve all owners
            return await _repository.ListAsync();
        }

        public async Task<bool> ActivateAsync(string nic)
        {
            // Inline comment at the beginning of method: set owner active
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required");
            return await _repository.SetActiveAsync(nic, true);
        }

        public async Task<bool> DeactivateAsync(string nic)
        {
            // Inline comment at the beginning of method: set owner inactive
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required");
            return await _repository.SetActiveAsync(nic, false);
        }
    }
}


