using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: BookingsController.cs
//  Created: 2025-10-01
//  Description: Backoffice endpoint to create bookings with a 7-day window.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Backoffice")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _service;

        public BookingsController(BookingService service)
        {
            // Inline comment at the beginning of method: capture booking service
            _service = service;
        }

        public record CreateBookingRequest(string StationId, string OwnerNic, DateTime ReservationAt);

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
        {
            // Inline comment at the beginning of method: create booking enforcing 7-day policy
            try
            {
                var created = await _service.CreateAsync(request.StationId, request.OwnerNic, request.ReservationAt);
                return Created($"api/bookings/{created.Id}", new
                {
                    message = "Booking created successfully",
                    id = created.Id,
                    stationId = created.StationId,
                    ownerNic = created.OwnerNic,
                    reservationAtUtc = created.ReservationAtUtc,
                    status = created.Status.ToString()
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}


