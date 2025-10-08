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
        Task<BookingModel> CreateAsync(BookingModel booking);
        Task<IEnumerable<BookingModel>> GetAllAsync();
        Task<IEnumerable<BookingModel>> GetByOwnerAsync(string ownerNic);
        Task<bool> UpdateAsync(string id, BookingModel booking);
        Task<bool> CancelAsync(string id);
        Task<BookingModel?> GetByIdAsync(string id);
        Task<bool> UpdateStatusAsync(string id, BookingStatus status);
        Task<bool> AnyActiveForStationAsync(string stationId);

        // conflict checks
        Task<bool> ExistsAtAsync(string stationId, DateTime reservationAtUtc);
        Task<bool> OwnerHasAtAsync(string ownerNic, DateTime reservationAtUtc);

        // conflict checks excluding a specific booking (for modify)
        Task<bool> ExistsAtExceptAsync(string stationId, DateTime reservationAtUtc, string excludeId);
        Task<bool> OwnerHasAtExceptAsync(string ownerNic, DateTime reservationAtUtc, string excludeId);
    }
}
