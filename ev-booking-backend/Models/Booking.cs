using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: Booking.cs
//  Created: 2025-10-01
//  Description: Booking entity capturing reservation within 7 days policy.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Models
{
    public enum BookingStatus
    {
        Pending = 1,
        Active = 2,
        Completed = 3,
        Cancelled = 4
    }

    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("stationId")]
        public string StationId { get; set; } = string.Empty;

        [BsonElement("ownerNic")]
        public string OwnerNic { get; set; } = string.Empty;

        [BsonElement("reservationAtUtc")]
        public DateTime ReservationAtUtc { get; set; }

        [BsonElement("createdAtUtc")]
        public DateTime CreatedAtUtc { get; set; }

        [BsonElement("status")]
        [BsonRepresentation(BsonType.String)]
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
    }
}


