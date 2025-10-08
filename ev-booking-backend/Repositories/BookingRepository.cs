using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Persistence;
using MongoDB.Driver;
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
            _bookings = context.Database.GetCollection<BookingModel>("bookings");

            // Unique on (StationId, ReservationAtUtc, Status in {Pending, Active})
            var indexKeys = Builders<BookingModel>.IndexKeys
                .Ascending(b => b.StationId)
                .Ascending(b => b.ReservationAtUtc)
                .Ascending(b => b.Status);

            var partial = Builders<BookingModel>.Filter.In(
                b => b.Status,
                new[] { BookingStatus.Pending, BookingStatus.Active }
            );

            var options = new CreateIndexOptions<BookingModel>
            {
                Unique = true,
                PartialFilterExpression = partial,
                Name = "ux_station_time_status_active_pending"
            };

            try
            {
                _bookings.Indexes.CreateOne(new CreateIndexModel<BookingModel>(indexKeys, options));
            }
            catch { /* ignore if already created */ }
        }

        public async Task<BookingModel> CreateAsync(BookingModel booking)
        {
            await _bookings.InsertOneAsync(booking);
            return booking;
        }

        public async Task<IEnumerable<BookingModel>> GetAllAsync()
            => await _bookings.Find(Builders<BookingModel>.Filter.Empty).ToListAsync();

        public async Task<IEnumerable<BookingModel>> GetByOwnerAsync(string ownerNic)
            => await _bookings.Find(Builders<BookingModel>.Filter.Eq(b => b.OwnerNic, ownerNic)).ToListAsync();

        public async Task<bool> UpdateAsync(string id, BookingModel booking)
        {
            booking.Id = id;
            var result = await _bookings.ReplaceOneAsync(b => b.Id == id, booking, new ReplaceOptions { IsUpsert = false });
            return result.ModifiedCount > 0;
        }

        public async Task<bool> CancelAsync(string id)
        {
            var update = Builders<BookingModel>.Update.Set(b => b.Status, BookingStatus.Cancelled);
            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<BookingModel?> GetByIdAsync(string id)
            => await _bookings.Find(b => b.Id == id).FirstOrDefaultAsync();

        public async Task<bool> UpdateStatusAsync(string id, BookingStatus status)
        {
            var update = Builders<BookingModel>.Update.Set(b => b.Status, status);
            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> AnyActiveForStationAsync(string stationId)
        {
            var filter = Builders<BookingModel>.Filter.And(
                Builders<BookingModel>.Filter.Eq(b => b.StationId, stationId),
                Builders<BookingModel>.Filter.In(b => b.Status, new[] { BookingStatus.Pending, BookingStatus.Active })
            );
            var count = await _bookings.CountDocumentsAsync(filter);
            return count > 0;
        }

        // ---- conflict checks ----
        public async Task<bool> ExistsAtAsync(string stationId, DateTime reservationAtUtc)
        {
            var filter = Builders<BookingModel>.Filter.And(
                Builders<BookingModel>.Filter.Eq(b => b.StationId, stationId),
                Builders<BookingModel>.Filter.Eq(b => b.ReservationAtUtc, reservationAtUtc),
                Builders<BookingModel>.Filter.In(b => b.Status, new[] { BookingStatus.Pending, BookingStatus.Active })
            );
            return await _bookings.CountDocumentsAsync(filter) > 0;
        }

        public async Task<bool> OwnerHasAtAsync(string ownerNic, DateTime reservationAtUtc)
        {
            var filter = Builders<BookingModel>.Filter.And(
                Builders<BookingModel>.Filter.Eq(b => b.OwnerNic, ownerNic),
                Builders<BookingModel>.Filter.Eq(b => b.ReservationAtUtc, reservationAtUtc),
                Builders<BookingModel>.Filter.In(b => b.Status, new[] { BookingStatus.Pending, BookingStatus.Active })
            );
            return await _bookings.CountDocumentsAsync(filter) > 0;
        }

        // ---- conflict checks (exclude current booking) ----
        public async Task<bool> ExistsAtExceptAsync(string stationId, DateTime reservationAtUtc, string excludeId)
        {
            var filter = Builders<BookingModel>.Filter.And(
                Builders<BookingModel>.Filter.Eq(b => b.StationId, stationId),
                Builders<BookingModel>.Filter.Eq(b => b.ReservationAtUtc, reservationAtUtc),
                Builders<BookingModel>.Filter.In(b => b.Status, new[] { BookingStatus.Pending, BookingStatus.Active }),
                Builders<BookingModel>.Filter.Ne(b => b.Id, excludeId)
            );
            return await _bookings.CountDocumentsAsync(filter) > 0;
        }

        public async Task<bool> OwnerHasAtExceptAsync(string ownerNic, DateTime reservationAtUtc, string excludeId)
        {
            var filter = Builders<BookingModel>.Filter.And(
                Builders<BookingModel>.Filter.Eq(b => b.OwnerNic, ownerNic),
                Builders<BookingModel>.Filter.Eq(b => b.ReservationAtUtc, reservationAtUtc),
                Builders<BookingModel>.Filter.In(b => b.Status, new[] { BookingStatus.Pending, BookingStatus.Active }),
                Builders<BookingModel>.Filter.Ne(b => b.Id, excludeId)
            );
            return await _bookings.CountDocumentsAsync(filter) > 0;
        }
    }
}
