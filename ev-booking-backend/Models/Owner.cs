using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: Owner.cs
//  Created: 2025-10-01
//  Description: EV Owner profile with NIC as the primary key (_id).
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Models
{
    public class Owner
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Nic { get; set; } = string.Empty;

        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("phone")]
        public string Phone { get; set; } = string.Empty;

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;
    }
}


