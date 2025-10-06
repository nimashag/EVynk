using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: ChargingStation.cs
//  Created: 2025-10-01
//  Description: Charging station entity with type, location, and available slots.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Models
{
    public enum StationType
    {
        AC = 1,
        DC = 2
    }

    public class ChargingStation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("location")]
        public string Location { get; set; } = string.Empty;

        [BsonElement("address")]
        public string Address { get; set; } = string.Empty;

        [BsonElement("lat")]
        public double? Lat { get; set; }

        [BsonElement("lng")]
        public double? Lng { get; set; }

        [BsonElement("type")]
        public StationType Type { get; set; }

        [BsonElement("availableSlots")]
        public int AvailableSlots { get; set; }

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("operatorIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public List<string> OperatorIds { get; set; } = new();
    }
}


