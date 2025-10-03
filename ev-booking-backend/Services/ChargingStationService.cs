using EVynk.Booking.Api.Models;
using EVynk.Booking.Api.Repositories;

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

        public ChargingStationService(IChargingStationRepository repository)
        {
            // Inline comment at the beginning of method: capture repository dependency
            _repository = repository;
        }

        public async Task<ChargingStation> CreateAsync(ChargingStation station)
        {
            // Inline comment at the beginning of method: basic validation and delegate to repo
            if (string.IsNullOrWhiteSpace(station.Location)) throw new ArgumentException("Location is required");
            if (station.AvailableSlots < 0) throw new ArgumentException("AvailableSlots cannot be negative");
            return await _repository.CreateAsync(station);
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
    }
}


