namespace EVynk.Booking.Api.Dtos
{
    // Compact payload the mobile app will render as a QR (only when Active)
    public record BookingQrDto(string Id, string OwnerNic, string StationId, DateTime ReservationAtUtc, string Status);
}
