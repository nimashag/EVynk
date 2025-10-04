using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;
using BookingModel = EVynk.Booking.Api.Models.Booking;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: BookingService.cs
//  Created: 2025-10-01
//  Description: Booking business logic with 7-day reservation window validation.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Services
{
    public class BookingService
    {
        private readonly IBookingRepository _repository;

        public BookingService(IBookingRepository repository)
        {
            // Inline comment at the beginning of method: capture repository dependency
            _repository = repository;
        }

        public async Task<BookingModel> CreateAsync(string stationId, string ownerNic, DateTime reservationAtLocal)
        {
            // Inline comment at the beginning of method: validate 7-day window and create booking
            var nowUtc = DateTime.UtcNow;
            var reservationUtc = reservationAtLocal.ToUniversalTime();

            if (reservationUtc < nowUtc)
                throw new ArgumentException("Reservation time must be in the future");

            if (reservationUtc > nowUtc.AddDays(7))
                throw new ArgumentException("Reservation time must be within 7 days from now");

            var booking = new BookingModel
            {
                StationId = stationId,
                OwnerNic = ownerNic,
                ReservationAtUtc = reservationUtc,
                CreatedAtUtc = nowUtc,
                Status = BookingStatus.Pending
            };

            return await _repository.CreateAsync(booking);
        }
    }
}


