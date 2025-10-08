using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;
using BookingModel = EVynk.Booking.Api.Models.Booking;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: BookingService.cs
//  Created: 2025-10-01
//  Description: Booking business logic (7-day window, 12-hour rules,
//               owner modify/cancel, and conflict checks).
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Services
{
    public class BookingService
    {
        private readonly IBookingRepository _repository;

        public BookingService(IBookingRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<BookingModel>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<IEnumerable<BookingModel>> GetByOwnerAsync(string ownerNic)
            => await _repository.GetByOwnerAsync(ownerNic);

        // ------- Backoffice create (kept) -------
        public async Task<BookingModel> CreateAsync(string stationId, string ownerNic, DateTime reservationAtLocal)
        {
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

        // ------- Owner create -------
        public async Task<BookingModel> CreateOwnerReservationAsync(string stationId, string ownerNic, DateTime reservationAtLocal)
        {
            var nowUtc = DateTime.UtcNow;
            var reservationUtc = reservationAtLocal.ToUniversalTime();

            if (reservationUtc <= nowUtc)
                throw new ArgumentException("Reservation time must be in the future.");

            if (reservationUtc > nowUtc.AddDays(7))
                throw new ArgumentException("Reservation time must be within 7 days from now.");

            if (await _repository.ExistsAtAsync(stationId, reservationUtc))
                throw new InvalidOperationException("This station already has a reservation at the selected time.");

            if (await _repository.OwnerHasAtAsync(ownerNic, reservationUtc))
                throw new InvalidOperationException("You already have a reservation at the selected time.");

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

        // ------- Owner modify (NEW) -------
        public async Task<BookingModel?> UpdateByOwnerAsync(string id, string ownerNic, string stationId, DateTime reservationAtLocal)
        {
            var booking = await _repository.GetByIdAsync(id);
            if (booking is null) return null;

            // Ensure ownership
            if (!string.Equals(booking.OwnerNic, ownerNic, StringComparison.Ordinal))
                throw new UnauthorizedAccessException("You can modify only your own reservations.");

            // Only Pending bookings can be modified (approved/active cannot)
            if (booking.Status != BookingStatus.Pending)
                throw new InvalidOperationException("Only pending reservations can be modified.");

            var nowUtc = DateTime.UtcNow;
            var newUtc = reservationAtLocal.ToUniversalTime();

            // Modification must be ≥ 12h before the CURRENT scheduled time
            if (booking.ReservationAtUtc <= nowUtc.AddHours(12))
                throw new InvalidOperationException("Cannot modify less than 12 hours before the scheduled time.");

            // New time rules
            if (newUtc <= nowUtc)
                throw new ArgumentException("New reservation time must be in the future.");

            if (newUtc > nowUtc.AddDays(7))
                throw new ArgumentException("New reservation time must be within 7 days from now.");

            // Conflict checks (exclude this booking id)
            if (await _repository.ExistsAtExceptAsync(stationId, newUtc, id))
                throw new InvalidOperationException("This station already has a reservation at the selected time.");

            if (await _repository.OwnerHasAtExceptAsync(ownerNic, newUtc, id))
                throw new InvalidOperationException("You already have a reservation at the selected time.");

            // Apply
            booking.StationId = stationId;
            booking.ReservationAtUtc = newUtc;

            var ok = await _repository.UpdateAsync(id, booking);
            return ok ? booking : null;
        }

        // ------- Owner cancel (NEW) -------
        public async Task<bool> CancelByOwnerAsync(string id, string ownerNic)
        {
            var booking = await _repository.GetByIdAsync(id);
            if (booking is null) return false;

            // Ensure ownership
            if (!string.Equals(booking.OwnerNic, ownerNic, StringComparison.Ordinal))
                throw new UnauthorizedAccessException("You can cancel only your own reservations.");

            // Only Pending can be cancelled by owner (once approved/active, operator controls the flow)
            if (booking.Status != BookingStatus.Pending)
                throw new InvalidOperationException("Only pending reservations can be cancelled.");

            var nowUtc = DateTime.UtcNow;

            if (booking.ReservationAtUtc <= nowUtc.AddHours(12))
                throw new InvalidOperationException("Cannot cancel less than 12 hours before the scheduled time.");

            return await _repository.CancelAsync(id);
        }

        // ------- Backoffice update/cancel/activate/complete (kept) -------
        public async Task<bool> UpdateAsync(string id, string stationId, string ownerNic, DateTime reservationAtLocal)
        {
            var booking = await _repository.GetByIdAsync(id);
            if (booking == null) return false;

            var nowUtc = DateTime.UtcNow;
            var reservationUtc = reservationAtLocal.ToUniversalTime();

            if (reservationUtc < nowUtc)
                throw new ArgumentException("Reservation time must be in the future");

            if (reservationUtc > nowUtc.AddDays(7))
                throw new ArgumentException("Reservation time must be within 7 days from now");

            if (reservationUtc <= nowUtc.AddHours(12))
                throw new InvalidOperationException("Cannot update reservation less than 12 hours before the scheduled time");

            booking.StationId = stationId;
            booking.OwnerNic = ownerNic;
            booking.ReservationAtUtc = reservationUtc;

            return await _repository.UpdateAsync(id, booking);
        }

        public async Task<bool> CancelAsync(string id)
        {
            var booking = await _repository.GetByIdAsync(id);
            if (booking == null) return false;

            var nowUtc = DateTime.UtcNow;

            if (booking.ReservationAtUtc <= nowUtc.AddHours(12))
                throw new InvalidOperationException("Cannot cancel reservation less than 12 hours before the scheduled time");

            return await _repository.CancelAsync(id);
        }

        public async Task<bool> ActivateAsync(string id)
        {
            var booking = await _repository.GetByIdAsync(id);
            if (booking == null) return false;

            if (booking.Status != BookingStatus.Pending)
                throw new InvalidOperationException($"Cannot activate booking with status: {booking.Status}");

            return await _repository.UpdateStatusAsync(id, BookingStatus.Active);
        }

        public async Task<bool> CompleteAsync(string id)
        {
            var booking = await _repository.GetByIdAsync(id);
            if (booking == null) return false;

            if (booking.Status != BookingStatus.Active)
                throw new InvalidOperationException($"Cannot complete booking with status: {booking.Status}");

            return await _repository.UpdateStatusAsync(id, BookingStatus.Completed);
        }
    }
}
