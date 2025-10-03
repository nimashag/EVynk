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

        public async Task<List<ChargingStation>> ListAsync()
        {
            // Inline comment at the beginning of method: list all stations
            return await _stations.Find(Builders<ChargingStation>.Filter.Empty).ToListAsync();
        }
    }
}


