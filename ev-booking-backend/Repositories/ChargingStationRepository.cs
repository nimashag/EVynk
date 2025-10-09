using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Persistence;
using MongoDB.Driver;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: ChargingStationRepository.cs
//  Created: 2025-10-01
//  Description: MongoDB-backed charging station repository.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Repositories
{
    public class ChargingStationRepository : IChargingStationRepository
    {
        private readonly IMongoCollection<ChargingStation> _stations;

        public ChargingStationRepository(MongoDbContext context)
        {
            // Inline comment at the beginning of method: initialize stations collection
            _stations = context.Database.GetCollection<ChargingStation>("charging-stations");
        }

        public async Task<ChargingStation> CreateAsync(ChargingStation station)
        {
            // Inline comment at the beginning of method: insert station document
            await _stations.InsertOneAsync(station);
            return station;
        }

        public async Task<ChargingStation?> GetByIdAsync(string id)
        {
            // Inline comment at the beginning of method: fetch a single station by ObjectId string
            return await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<ChargingStation>> ListAsync()
        {
            // Inline comment at the beginning of method: list all stations
            return await _stations.Find(Builders<ChargingStation>.Filter.Empty).ToListAsync();
        }

        public async Task<bool> UpdateAsync(string id, ChargingStation station)
        {
            // Inline comment at the beginning of method: replace station document by id
            station.Id = id;
            var result = await _stations.ReplaceOneAsync(s => s.Id == id, station, new ReplaceOptions { IsUpsert = false });
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SetAvailableSlotsAsync(string id, int availableSlots)
        {
            // Inline comment at the beginning of method: update only availableSlots
            var update = Builders<ChargingStation>.Update.Set(s => s.AvailableSlots, availableSlots);
            var result = await _stations.UpdateOneAsync(s => s.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SetActiveAsync(string id, bool isActive)
        {
            // Inline comment at the beginning of method: set station active flag
            var update = Builders<ChargingStation>.Update.Set(s => s.IsActive, isActive);
            var result = await _stations.UpdateOneAsync(s => s.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            // Inline comment at the beginning of method: delete station document by id
            var result = await _stations.DeleteOneAsync(s => s.Id == id);
            return result.DeletedCount > 0;
        }
        
public async Task<List<ChargingStation>> GetByOperatorIdAsync(string operatorId)
{
    var filter = Builders<ChargingStation>.Filter.AnyEq(s => s.OperatorIds, operatorId);
    return await _stations.Find(filter).ToListAsync();
}


    }
}


