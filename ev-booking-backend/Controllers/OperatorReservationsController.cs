// Controllers/OperatorReservationsController.cs
using EVynk.Booking.Api.Repositories;
using EVynk.Booking.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/operator/reservations")]
[Authorize(Roles = nameof(UserRole.StationOperator))]
public class OperatorReservationsController : ControllerBase
{
    private readonly IBookingRepository _bookings;

    public OperatorReservationsController(IBookingRepository bookings) => _bookings = bookings;

    public record ScanVerifyRequest(string BookingId, string OwnerNic, string StationId);

    // POST /api/operator/reservations/verify
    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] ScanVerifyRequest req)
    {
        var b = await _bookings.GetByIdAsync(req.BookingId);
        if (b is null) return NotFound(new { message = "Booking not found." });
        if (b.OwnerNic != req.OwnerNic || b.StationId != req.StationId)
            return BadRequest(new { message = "QR payload mismatch." });
        if (b.Status != BookingStatus.Active)
            return BadRequest(new { message = "Only Active bookings can be verified for charging." });

        return Ok(new { message = "Verified", data = new { b.Id, b.OwnerNic, b.StationId, b.ReservationAtUtc, status = b.Status.ToString() } });
    }

    // PATCH /api/operator/reservations/{id}/complete
    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> Complete([FromRoute] string id)
    {
        var b = await _bookings.GetByIdAsync(id);
        if (b is null) return NotFound(new { message = "Booking not found." });
        if (b.Status != BookingStatus.Active)
            return BadRequest(new { message = "Only Active bookings can be completed." });

        b.Status = BookingStatus.Completed;
        var ok = await _bookings.UpdateAsync(id, b);
        return ok ? Ok(new { message = "Charging session completed.", id, status = "Completed" })
                  : StatusCode(500, new { message = "Failed to update booking." });
    }
}
