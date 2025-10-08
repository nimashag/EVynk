using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: ChargingStationService.cs
//  Created: 2025-10-01
//  Description: Business logic for charging station management.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Services
{
    public class ChargingStationService
    {
        private readonly IChargingStationRepository _repository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ChargingStationService(IChargingStationRepository repository, IBookingRepository bookingRepository, IHttpContextAccessor httpContextAccessor)
        {
            // Inline comment at the beginning of method: capture repository dependencies
            _repository = repository;
            _bookingRepository = bookingRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ChargingStation> CreateAsync(ChargingStation station)
        {
            var userRole = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(station.Location))
                throw new ArgumentException("Location is required");

            if (station.AvailableSlots < 0)
                throw new ArgumentException("AvailableSlots cannot be negative");

            // ✅ Logic: Station Operator can assign only themselves
            if (userRole == UserRole.StationOperator.ToString())
            {
                var userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                station.OperatorIds = new List<string> { userId! };
            }

            return await _repository.CreateAsync(station);
        }

        public async Task<ChargingStation?> GetByIdAsync(string id)
        {
            // Inline comment at the beginning of method: read-through to repository
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id is required");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<List<ChargingStation>> ListAsync()
        {
            // Inline comment at the beginning of method: return all stations
            return await _repository.ListAsync();
        }

        public async Task<bool> UpdateAsync(string id, ChargingStation station)
        {
            // Inline comment at the beginning of method: validate and update station
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id is required");
            if (string.IsNullOrWhiteSpace(station.Location)) throw new ArgumentException("Location is required");
            if (station.AvailableSlots < 0) throw new ArgumentException("AvailableSlots cannot be negative");
            return await _repository.UpdateAsync(id, station);
        }

        public async Task<bool> SetAvailableSlotsAsync(string id, int availableSlots)
        {
            // Inline comment at the beginning of method: validate and set slots
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id is required");
            if (availableSlots < 0) throw new ArgumentException("AvailableSlots cannot be negative");
            return await _repository.SetAvailableSlotsAsync(id, availableSlots);
        }

        public async Task<bool> SetActiveAsync(string id, bool isActive)
        {
            // Inline comment at the beginning of method: prevent deactivation when active bookings exist
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id is required");
            
            if (!isActive)
            {
                var hasActive = await _bookingRepository.AnyActiveForStationAsync(id);
                if (hasActive) throw new InvalidOperationException("Cannot deactivate station with active bookings");
            }
            
            return await _repository.SetActiveAsync(id, isActive);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            // Inline comment at the beginning of method: hard delete guard against active bookings
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id is required");
            var hasActive = await _bookingRepository.AnyActiveForStationAsync(id);
            if (hasActive) throw new InvalidOperationException("Cannot delete station with active bookings");
            return await _repository.DeleteAsync(id);
        }
    }
}


