#nullable enable
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;

//
// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnerService.cs
//  Created: 2025-10-07
//  Description: Business logic for EV Owner operations.
//               Wraps repository with validation, normalization,
//               and status transition rules.
//  Author: Student
// ==============================================
//

namespace EVynk.Booking.Api.Services
{
    public class OwnerService
    {
        private readonly IOwnerRepository _repository;

        /// <summary>
        /// Capture repository dependency.
        /// </summary>
        public OwnerService(IOwnerRepository repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Create a new owner. Enforces NIC presence and format, then delegates to repo.
        /// </summary>
        public async Task<Owner> CreateAsync(Owner owner)
        {
            if (owner is null) throw new ArgumentNullException(nameof(owner));
            if (string.IsNullOrWhiteSpace(owner.Nic)) throw new ArgumentException("NIC is required.", nameof(owner.Nic));

            // Lightweight pre-checks (model's Normalize/Validate will run in repo as well)
            if (!Regex.IsMatch(owner.Nic, OwnerConstants.NicPattern, RegexOptions.IgnoreCase))
                throw new ArgumentException("NIC format is invalid. Use 9 digits + V/X or 12 digits.", nameof(owner.Nic));

            return await _repository.CreateAsync(owner);
        }

        /// <summary>
        /// Get a single owner by NIC. Returns null if not found.
        /// </summary>
        public Task<Owner?> GetByNicAsync(string nic)
        {
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required.", nameof(nic));
            return _repository.GetByNicAsync(nic);
        }

        /// <summary>
        /// List owners, optionally filtered by status.
        /// </summary>
        public Task<List<Owner>> ListAsync(OwnerStatus? status = null)
        {
            return _repository.ListAsync(status);
        }

        /// <summary>
        /// Update an existing owner (by NIC). NIC itself cannot be changed.
        /// </summary>
        public async Task<bool> UpdateAsync(string nic, Owner updated)
        {
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required.", nameof(nic));
            if (updated is null) throw new ArgumentNullException(nameof(updated));

            // Do not allow NIC changes
            updated.Nic = nic;
            return await _repository.UpdateAsync(nic, updated);
        }

        /// <summary>
        /// Permanently delete owner by NIC. Prefer soft delete at controller/policy layer if needed.
        /// </summary>
        public Task<bool> DeleteAsync(string nic)
        {
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required.", nameof(nic));
            return _repository.DeleteAsync(nic);
        }

        /// <summary>
        /// Self-deactivation flow (mobile app). Marks Deactivated with 'self'.
        /// </summary>
        public Task<bool> DeactivateSelfAsync(string nic)
        {
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required.", nameof(nic));
            return _repository.SetStatusAsync(nic, OwnerStatus.Deactivated, changedBy: "self");
        }

        /// <summary>
        /// Backoffice-triggered status change (reactivation or deactivation with audit).
        /// </summary>
        public Task<bool> SetStatusByBackofficeAsync(string nic, OwnerStatus status, string backofficeUserIdOrEmail)
        {
            if (string.IsNullOrWhiteSpace(nic)) throw new ArgumentException("NIC is required.", nameof(nic));
            if (string.IsNullOrWhiteSpace(backofficeUserIdOrEmail)) backofficeUserIdOrEmail = "backoffice";

            return _repository.SetStatusAsync(nic, status, changedBy: backofficeUserIdOrEmail);
        }

        /// <summary>
        /// Ensure required MongoDB indexes exist (call once during startup).
        /// </summary>
        public Task EnsureIndexesAsync()
        {
            return _repository.EnsureIndexesAsync();
        }
    }
}
