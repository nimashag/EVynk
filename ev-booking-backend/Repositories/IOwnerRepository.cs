using EVynk.Booking.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

//
// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: IOwnerRepository.cs
//  Created: 2025-10-07
//  Description: Abstraction for EV owner data access using NIC (_id).
//               Supports CRUD, status transitions, and index creation.
//  Author: Student
// ==============================================
//

namespace EVynk.Booking.Api.Repositories
{
    public interface IOwnerRepository
    {
        /// <summary>
        /// Create a new owner document (NIC as _id). Validates and normalizes before insert.
        /// </summary>
        Task<Owner> CreateAsync(Owner owner);

        /// <summary>
        /// Retrieve owner by NIC (primary key). Returns null if not found.
        /// </summary>
        Task<Owner?> GetByNicAsync(string nic);

        /// <summary>
        /// List all owners, optionally filtered by status.
        /// </summary>
        Task<List<Owner>> ListAsync(OwnerStatus? status = null);

        /// <summary>
        /// Replace an existing owner document by NIC (no NIC change allowed).
        /// </summary>
        Task<bool> UpdateAsync(string nic, Owner owner);

        /// <summary>
        /// Permanently delete owner document by NIC (use with caution; prefer soft delete).
        /// </summary>
        Task<bool> DeleteAsync(string nic);

        /// <summary>
        /// Change account status (Active/Deactivated). Automatically sets audit fields.
        /// </summary>
        Task<bool> SetStatusAsync(string nic, OwnerStatus newStatus, string? changedBy = null);

        /// <summary>
        /// Ensure MongoDB indexes (unique email, phone, and status).
        /// Should be called once at application startup.
        /// </summary>
        Task EnsureIndexesAsync();
    }
}
