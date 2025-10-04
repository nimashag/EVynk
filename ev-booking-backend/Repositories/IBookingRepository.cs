using EVynk.Booking.Api.Models;
using BookingModel = EVynk.Booking.Api.Models.Booking;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: IBookingRepository.cs
//  Created: 2025-10-01
//  Description: Booking data access abstraction.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Repositories
{
    public interface IBookingRepository
    {
        // Inline comment at the beginning of method: create a new booking
        Task<BookingModel> CreateAsync(BookingModel booking);
    }
}


