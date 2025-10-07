using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: User.cs
//  Created: 2025-10-01
//  Description: User entity with role for authentication/authorization.
//  Author: Student
// ==============================================

namespace EVynk.Booking.Api.Models
{
    public enum UserRole
    {
        Backoffice = 1,
        StationOperator = 2,
        Owner = 3 
    }

    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("role")]
        [BsonRepresentation(BsonType.String)]
        public UserRole Role { get; set; }
    }
}


