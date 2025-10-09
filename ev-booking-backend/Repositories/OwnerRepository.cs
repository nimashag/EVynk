using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Persistence;
using MongoDB.Driver;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: OwnerRepository.cs
//  Created: 2025-10-01
//  Description: MongoDB-backed owner repository using NIC as _id.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Repositories
{
    public class OwnerRepository : IOwnerRepository
    {
        private readonly IMongoCollection<Owner> _owners;

        public OwnerRepository(MongoDbContext context)
        {
            // Inline comment at the beginning of method: initialize owners collection ("ev-owners")
            _owners = context.Database.GetCollection<Owner>("ev-owners");
        }

        public async Task<Owner> CreateAsync(Owner owner)
        {
            // Inline comment at the beginning of method: insert owner with NIC as _id
            await _owners.InsertOneAsync(owner);
            return owner;
        }

        public async Task<bool> UpdateAsync(string nic, Owner owner)
        {
            // Inline comment at the beginning of method: replace document matching NIC
            owner.Nic = nic;
            var result = await _owners.ReplaceOneAsync(o => o.Nic == nic, owner, new ReplaceOptions { IsUpsert = false });
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string nic)
        {
            // Inline comment at the beginning of method: delete by NIC
            var result = await _owners.DeleteOneAsync(o => o.Nic == nic);
            return result.DeletedCount > 0;
        }

        public async Task<Owner?> GetByNicAsync(string nic)
        {
            // Inline comment at the beginning of method: find by NIC
            return await _owners.Find(o => o.Nic == nic).FirstOrDefaultAsync();
        }

        public async Task<List<Owner>> ListAsync()
        {
            // Inline comment at the beginning of method: return all owners
            return await _owners.Find(Builders<Owner>.Filter.Empty).ToListAsync();
        }

        public async Task<bool> SetActiveAsync(string nic, bool isActive)
        {
            // Inline comment at the beginning of method: update isActive field by NIC
            var update = Builders<Owner>.Update.Set(o => o.IsActive, isActive);
            var result = await _owners.UpdateOneAsync(o => o.Nic == nic, update);
            return result.ModifiedCount > 0;
        }

         // Inline comment at the beginning of method: find owner by email
        public async Task<Owner?> FindByEmailAsync(string email) =>
            await _owners.Find(o => o.Email == email).FirstOrDefaultAsync();
    }
}


