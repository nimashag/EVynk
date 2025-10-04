using EVynk.Booking.Api.Models;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: IChargingStationRepository.cs
//  Created: 2025-10-01
//  Description: Abstraction for charging station data access.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Repositories
{
    public interface IChargingStationRepository
    {
        // Inline comment at the beginning of method: create station
        Task<ChargingStation> CreateAsync(ChargingStation station);

        // Inline comment at the beginning of method: list all stations
        Task<List<ChargingStation>> ListAsync();

        // Inline comment at the beginning of method: update station details
        Task<bool> UpdateAsync(string id, ChargingStation station);

        // Inline comment at the beginning of method: set available slots
        Task<bool> SetAvailableSlotsAsync(string id, int availableSlots);

        // Inline comment at the beginning of method: set station active status
        Task<bool> SetActiveAsync(string id, bool isActive);
    }
}


