using EVynk.Booking.Api.Dtos;
using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;
using BookingEntity = EVynk.Booking.Api.Models.Booking;

namespace EVynk.Booking.Api.Services
{
    // ==============================================
    //  Project: EVynk Booking Backend (API)
    //  File: OwnerReservationService.cs
    //  Created: 2025-10-08
    //  Description: Business logic for EV Owner reservation CRUD.
    //               Enforces 7-day create window and ≥12-hour update/cancel rules.
    //               Returns StationName by joining with ChargingStation.
    //  Author: Student
    // ==============================================
    public class OwnerReservationService
    {
        private readonly IBookingRepository _bookings;
        private readonly ChargingStationService _stations;
        private readonly OwnerService _owners;

        public OwnerReservationService(
            IBookingRepository bookings,
            ChargingStationService stations,
            OwnerService owners)
        {
            // Inline: DI for repositories/services
            _bookings = bookings;
            _stations = stations;
            _owners = owners;
        }

        // Inline helper: normalize DateTime to UTC
        private static DateTime AsUtc(DateTime dt) =>
            dt.Kind == DateTimeKind.Utc ? dt :
            dt.Kind == DateTimeKind.Local ? dt.ToUniversalTime() :
            DateTime.SpecifyKind(dt, DateTimeKind.Utc);

        // Inline helper: 7-day window from now (future only)
        private static void GuardCreateWindow(DateTime nowUtc, DateTime reservationAtUtc)
        {
            if (reservationAtUtc <= nowUtc)
                throw new ArgumentException("Reservation must be in the future.");
            if (reservationAtUtc > nowUtc.AddDays(7))
                throw new ArgumentException("Reservation must be within 7 days from today.");
        }

        // Inline helper: ≥12-hour cutoff for updates/cancels
        private static void GuardChangeCutoff(DateTime nowUtc, DateTime reservationAtUtc)
        {
            if (reservationAtUtc - nowUtc < TimeSpan.FromHours(12))
                throw new InvalidOperationException("Changes are allowed only 12 hours before the reservation time.");
        }

        // Inline helper: map entity to DTO with station name
        private static BookingSummaryDto ToDto(BookingEntity b, string stationName) =>
            new(b.Id, b.StationId, stationName, b.OwnerNic, b.ReservationAtUtc, b.Status.ToString());

        // CREATE
        public async Task<BookingSummaryDto> CreateAsync(string ownerNic, string stationId, DateTime reservationAt)
        {
            // Inline: create a new reservation for the given owner; enforce assignment rules
            var nowUtc = DateTime.UtcNow;
            var reservationAtUtc = AsUtc(reservationAt);

            // Owner must exist and be active
            var owner = await _owners.GetByNicAsync(ownerNic);
            if (owner is null || !owner.IsActive)
                throw new ArgumentException("Owner not found or not active.");

            // Station must exist and be active
            var station = await _stations.GetByIdAsync(stationId);
            if (station is null || !station.IsActive)
                throw new ArgumentException("Charging station not found or inactive.");

            // Policy checks
            GuardCreateWindow(nowUtc, reservationAtUtc);

            // Naive slot-collision guard using current repo surface (GetAllAsync)
            var all = await _bookings.GetAllAsync();
            var slotTaken = all.Any(b =>
                b.StationId == stationId &&
                b.ReservationAtUtc == reservationAtUtc &&
                (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Active));
            if (slotTaken)
                throw new InvalidOperationException("This time slot is already taken at the selected station.");

            var booking = new BookingEntity
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                StationId = stationId,
                OwnerNic = ownerNic,
                ReservationAtUtc = reservationAtUtc,
                CreatedAtUtc = nowUtc,
                Status = BookingStatus.Pending
            };

            var created = await _bookings.CreateAsync(booking);
            return ToDto(created, station.Location /* treat as StationName */);
        }

        // READ (single, scoped to owner)
        public async Task<BookingSummaryDto?> GetByIdForOwnerAsync(string id, string ownerNic)
        {
            // Inline: fetch booking only if it belongs to the owner
            var b = await _bookings.GetByIdAsync(id);
            if (b is null || b.OwnerNic != ownerNic) return null;

            var station = await _stations.GetByIdAsync(b.StationId);
            var name = station?.Location ?? "(Unknown)";
            return ToDto(b, name);
        }

        // LIST upcoming (owner)
        public async Task<List<BookingSummaryDto>> GetUpcomingAsync(string ownerNic)
        {
            var nowUtc = DateTime.UtcNow;

            // 🔧 Null-safe: coalesce to empty sequence
            var all = (await _bookings.GetAllAsync()) ?? Enumerable.Empty<BookingEntity>();

            var list = all
                .Where(b => b.OwnerNic == ownerNic && b.ReservationAtUtc >= nowUtc)
                .OrderBy(b => b.ReservationAtUtc)
                .ToList();

            var cache = new Dictionary<string, string>();
            var result = new List<BookingSummaryDto>();
            foreach (var b in list)
            {
                if (!cache.TryGetValue(b.StationId, out var sname))
                {
                    sname = (await _stations.GetByIdAsync(b.StationId))?.Location ?? "(Unknown)";
                    cache[b.StationId] = sname;
                }
                result.Add(ToDto(b, sname));
            }
            return result;
        }

        // LIST history (owner)
        public async Task<List<BookingSummaryDto>> GetHistoryAsync(string ownerNic)
        {
            var nowUtc = DateTime.UtcNow;

            // 🔧 Null-safe: coalesce to empty sequence
            var all = (await _bookings.GetAllAsync()) ?? Enumerable.Empty<BookingEntity>();

            var list = all
                .Where(b => b.OwnerNic == ownerNic && b.ReservationAtUtc < nowUtc)
                .OrderByDescending(b => b.ReservationAtUtc)
                .ToList();

            var cache = new Dictionary<string, string>();
            var result = new List<BookingSummaryDto>();
            foreach (var b in list)
            {
                if (!cache.TryGetValue(b.StationId, out var sname))
                {
                    sname = (await _stations.GetByIdAsync(b.StationId))?.Location ?? "(Unknown)";
                    cache[b.StationId] = sname;
                }
                result.Add(ToDto(b, sname));
            }
            return result;
        }

        // UPDATE
        public async Task<bool> UpdateAsync(string id, string ownerNic, string stationId, DateTime reservationAt)
        {
            // Inline: owner can update only own Pending booking; ≥12h before original time
            var nowUtc = DateTime.UtcNow;
            var existing = await _bookings.GetByIdAsync(id);
            if (existing is null || existing.OwnerNic != ownerNic) return false;

            if (existing.Status != BookingStatus.Pending)
                throw new InvalidOperationException("Only pending reservations can be updated by the owner.");

            GuardChangeCutoff(nowUtc, existing.ReservationAtUtc);

            var station = await _stations.GetByIdAsync(stationId);
            if (station is null || !station.IsActive)
                throw new ArgumentException("Charging station not found or inactive.");

            var newUtc = AsUtc(reservationAt);
            GuardCreateWindow(nowUtc, newUtc);

            // Ensure new slot is not taken
            var all = (await _bookings.GetAllAsync()).ToList();
            var slotTaken = all.Any(b =>
                b.Id != id &&
                b.StationId == stationId &&
                b.ReservationAtUtc == newUtc &&
                (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Active));
            if (slotTaken)
                throw new InvalidOperationException("This time slot is already taken at the selected station.");

            // Apply updates
            existing.StationId = stationId;
            existing.ReservationAtUtc = newUtc;

            return await _bookings.UpdateAsync(id, existing);
        }

        // CANCEL
        public async Task<bool> CancelAsync(string id, string ownerNic)
        {
            // Inline: owner can cancel only own booking; ≥12h before; not Completed
            var nowUtc = DateTime.UtcNow;
            var existing = await _bookings.GetByIdAsync(id);
            if (existing is null || existing.OwnerNic != ownerNic) return false;

            if (existing.Status == BookingStatus.Completed)
                throw new InvalidOperationException("Completed reservations cannot be cancelled.");

            GuardChangeCutoff(nowUtc, existing.ReservationAtUtc);

            existing.Status = BookingStatus.Cancelled;
            return await _bookings.UpdateAsync(id, existing);
        }
    }
}
