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
    }
}


