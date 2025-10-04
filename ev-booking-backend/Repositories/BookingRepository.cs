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
            // Inline comment at the beginning of method: initialize bookings collection
            _bookings = context.Database.GetCollection<BookingModel>("bookings");
        }

        public async Task<BookingModel> CreateAsync(BookingModel booking)
        {
            // Inline comment at the beginning of method: insert booking document
            await _bookings.InsertOneAsync(booking);
            return booking;
        }
    }
}


