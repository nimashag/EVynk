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
    [Authorize(Roles = "Backoffice, StationOperator")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _service;

        public BookingsController(BookingService service)
        {
            // capture booking service
            _service = service;
        }

        public record CreateBookingRequest(string StationId, string OwnerNic, DateTime ReservationAt);

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
        {
            // create booking enforcing 7-day policy
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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // retrieve all bookings
            try
            {
                var bookings = await _service.GetAllAsync();
                return Ok(new
                {
                    message = "Bookings fetched successfully",
                    data = bookings
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving bookings", error = ex.Message });
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] CreateBookingRequest request)
        {
            // update booking with 12-hour validation
            try
            {
                var updated = await _service.UpdateAsync(id, request.StationId, request.OwnerNic, request.ReservationAt);
                if (!updated) return NotFound();
                return Ok(new
                {
                    message = "Booking updated successfully",
                    id = id,
                    stationId = request.StationId,
                    ownerNic = request.OwnerNic,
                    reservationAtUtc = request.ReservationAt.ToUniversalTime(),
                    status = "Pending"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel([FromRoute] string id)
        {
            // cancel booking with 12-hour validation
            try
            {
                var cancelled = await _service.CancelAsync(id);
                if (!cancelled) return NotFound();
                return Ok(new { message = "Booking cancelled successfully", id = id, status = "Cancelled" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> Activate([FromRoute] string id)
        {
            // activate booking (Pending -> Active)
            try
            {
                var activated = await _service.ActivateAsync(id);
                if (!activated) return NotFound();
                return Ok(new { message = "Booking activated successfully", id = id, status = "Active" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> Complete([FromRoute] string id)
        {
            // complete booking (Active -> Completed)
            try
            {
                var completed = await _service.CompleteAsync(id);
                if (!completed) return NotFound();
                return Ok(new { message = "Booking completed successfully", id = id, status = "Completed" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}

