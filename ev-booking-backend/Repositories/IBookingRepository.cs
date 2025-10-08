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

        // Inline comment at the beginning of method: retrieve all bookings
        Task<IEnumerable<BookingModel>> GetAllAsync();
        
        // Inline comment at the beginning of method: update booking details
        Task<bool> UpdateAsync(string id, BookingModel booking);

        // Inline comment at the beginning of method: cancel booking by id
        Task<bool> CancelAsync(string id);

        // Inline comment at the beginning of method: get booking by id
        Task<BookingModel?> GetByIdAsync(string id);

        // Inline comment at the beginning of method: update booking status
        Task<bool> UpdateStatusAsync(string id, BookingStatus status);

        // Inline comment at the beginning of method: check if station has active bookings
        Task<bool> AnyActiveForStationAsync(string stationId);
    }
}


