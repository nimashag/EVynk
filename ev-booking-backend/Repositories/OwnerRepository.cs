using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Persistence;
using MongoDB.Driver;

//
// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnerRepository.cs
//  Created: 2025-10-07
//  Description: MongoDB-backed Owner repository using NIC (_id).
//               Implements CRUD, status transitions, timestamps,
//               and index creation. Pairs with IOwnerRepository.cs.
//  Author: Student
// ==============================================
//

namespace EVynk.Booking.Api.Repositories
{
    public class OwnerRepository : IOwnerRepository
    {
        private readonly IMongoCollection<Owner> _owners;

        /// <summary>
        /// Ctor: initialize owners collection ("ev-owners") from MongoDbContext.
        /// </summary>
        public OwnerRepository(MongoDbContext context)
        {
            // Inline: initialize owners collection
            _owners = context.Database.GetCollection<Owner>("ev-owners");
        }

        /// <summary>
        /// Create a new owner (NIC as _id). Normalizes & validates before insert.
        /// </summary>
        public async Task<Owner> CreateAsync(Owner owner)
        {
            // Inline: prepare owner then insert
            owner.Normalize();
            owner.Validate();
            owner.NicMirror = owner.Nic;
            owner.CreatedAt = DateTime.UtcNow;
            owner.UpdatedAt = DateTime.UtcNow;

            await _owners.InsertOneAsync(owner);
            return owner;
        }

        /// <summary>
        /// Get owner by NIC. Returns null if not found.
        /// </summary>
        public async Task<Owner?> GetByNicAsync(string nic)
        {
            // Inline: query by _id/NIC
            return await _owners.Find(o => o.Nic == nic).FirstOrDefaultAsync();
        }

        /// <summary>
        /// List owners, optionally filtered by status.
        /// </summary>
        public async Task<List<Owner>> ListAsync(OwnerStatus? status = null)
        {
            // Inline: build optional status filter
            var filter = status == null
                ? Builders<Owner>.Filter.Empty
                : Builders<Owner>.Filter.Eq(o => o.Status, status);
            return await _owners.Find(filter).ToListAsync();
        }

        /// <summary>
        /// Replace existing owner by NIC. NIC cannot be changed.
        /// </summary>
        public async Task<bool> UpdateAsync(string nic, Owner owner)
        {
            // Inline: preserve immutable + audit; validate then replace
            var existing = await GetByNicAsync(nic);
            if (existing is null) return false;

            owner.Nic        = existing.Nic;        // preserve PK
            owner.NicMirror  = existing.NicMirror;  // keep mirror in sync
            owner.CreatedAt  = existing.CreatedAt;  // preserve createdAt
            owner.UpdatedAt  = DateTime.UtcNow;

            owner.Normalize();
            owner.Validate();

            var result = await _owners.ReplaceOneAsync(
                Builders<Owner>.Filter.Eq(o => o.Nic, nic),
                owner,
                new ReplaceOptions { IsUpsert = false }
            );

            return result.ModifiedCount > 0;
        }

        /// <summary>
        /// Permanently delete owner by NIC (prefer soft delete in services if needed).
        /// </summary>
        public async Task<bool> DeleteAsync(string nic)
        {
            // Inline: hard delete by NIC
            var result = await _owners.DeleteOneAsync(o => o.Nic == nic);
            return result.DeletedCount > 0;
        }

        /// <summary>
        /// Set owner status (Active/Deactivated) with audit fields.
        /// </summary>
        public async Task<bool> SetStatusAsync(string nic, OwnerStatus newStatus, string? changedBy = null)
        {
            // Inline: build update def based on target status
            var update = Builders<Owner>.Update
                .Set(o => o.Status, newStatus)
                .Set(o => o.UpdatedAt, DateTime.UtcNow);

            if (newStatus == OwnerStatus.Deactivated)
            {
                update = update
                    .Set(o => o.DeactivatedAt, DateTime.UtcNow)
                    .Set(o => o.DeactivatedBy, changedBy ?? "self");
            }
            else
            {
                update = update
                    .Set(o => o.DeactivatedAt, null)
                    .Set(o => o.DeactivatedBy, null);
            }

            var result = await _owners.UpdateOneAsync(
                Builders<Owner>.Filter.Eq(o => o.Nic, nic),
                update
            );

            return result.ModifiedCount > 0;
        }

        /// <summary>
        /// Ensure indexes: unique email (case-insensitive), unique phone (optional), status.
        /// Call once during app startup.
        /// </summary>
        public async Task EnsureIndexesAsync()
        {
            // Inline: create multiple indexes
            var indexKeys = Builders<Owner>.IndexKeys;

            var emailIndex = new CreateIndexModel<Owner>(
                indexKeys.Ascending(o => o.Email),
                new CreateIndexOptions
                {
                    Name = "ux_owner_email",
                    Unique = true,
                    Collation = new Collation("en", strength: CollationStrength.Secondary) // case-insensitive
                });

            var phoneIndex = new CreateIndexModel<Owner>(
                indexKeys.Ascending(o => o.Phone),
                new CreateIndexOptions
                {
                    Name = "ux_owner_phone",
                    Unique = true
                });

            var statusIndex = new CreateIndexModel<Owner>(
                indexKeys.Ascending(o => o.Status),
                new CreateIndexOptions { Name = "ix_owner_status" });

            await _owners.Indexes.CreateManyAsync(new[] { emailIndex, phoneIndex, statusIndex });
        }
    }
}
