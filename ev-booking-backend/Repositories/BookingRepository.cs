using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Persistence;
using MongoDB.Driver;
using MongoDB.Bson;
using BookingModel = EVynk.Booking.Api.Models.Booking;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: BookingRepository.cs
//  Created: 2025-10-01
//  Description: MongoDB-backed repository for bookings.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly IMongoCollection<BookingModel> _bookings;

        public BookingRepository(MongoDbContext context)
        {
            // Inline comment at the beginning of method: initialize bookings collection
            _bookings = context.Database.GetCollection<BookingModel>("bookings");
        }

        public async Task<BookingModel> CreateAsync(BookingModel booking)
        {
            // Inline comment at the beginning of method: insert booking document
            await _bookings.InsertOneAsync(booking);
            return booking;
        }

        public async Task<IEnumerable<BookingModel>> GetAllAsync()
        {
            // Inline comment at the beginning of method: retrieve all bookings
            return await _bookings.Find(Builders<BookingModel>.Filter.Empty).ToListAsync();
        }

        public async Task<List<BookingModel>> GetByStationIdsAsync(List<string> stationIds)
{
    if (stationIds == null || stationIds.Count == 0)
        return new List<BookingModel>();

    // Convert valid string IDs to ObjectIds
    var objectIds = new List<ObjectId>();
    foreach (var id in stationIds)
    {
        if (ObjectId.TryParse(id, out var objId))
            objectIds.Add(objId);
    }

    // Match both string and ObjectId stationId values
    var filter = Builders<BookingModel>.Filter.Or(
        Builders<BookingModel>.Filter.In("stationId", stationIds),
        Builders<BookingModel>.Filter.In("stationId", objectIds)
    );

    var results = await _bookings.Find(filter).ToListAsync();
    
    return results;
}



        public async Task<bool> UpdateAsync(string id, BookingModel booking)
        {
            // Inline comment at the beginning of method: replace booking document by id
            booking.Id = id;
            var result = await _bookings.ReplaceOneAsync(b => b.Id == id, booking, new ReplaceOptions { IsUpsert = false });
            return result.ModifiedCount > 0;
        }

        public async Task<bool> CancelAsync(string id)
        {
            // Inline comment at the beginning of method: set status to cancelled
            var update = Builders<BookingModel>.Update.Set(b => b.Status, BookingStatus.Cancelled);
            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<BookingModel?> GetByIdAsync(string id)
        {
            // Inline comment at the beginning of method: find booking by id
            return await _bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateStatusAsync(string id, BookingStatus status)
        {
            // Inline comment at the beginning of method: update booking status
            var update = Builders<BookingModel>.Update.Set(b => b.Status, status);
            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> AnyActiveForStationAsync(string stationId)
        {
            // Inline comment at the beginning of method: check for active bookings for station
            var filter = Builders<BookingModel>.Filter.And(
                Builders<BookingModel>.Filter.Eq(b => b.StationId, stationId),
                Builders<BookingModel>.Filter.In(b => b.Status, new[] { BookingStatus.Pending, BookingStatus.Active })
            );
            var count = await _bookings.CountDocumentsAsync(filter);
            return count > 0;
        }
        
    }
}


