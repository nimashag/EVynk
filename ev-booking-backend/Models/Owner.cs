#nullable enable
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

//
// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: Owner.cs
//  Created: 2025-10-07
//  Description: EV Owner aggregate (MongoDB) with NIC as primary key (_id).
//               Implements status transitions (Active/Deactivated),
//               metadata (created/updated), basic auth subdocument,
//               and optional address/vehicle profiles.
//  Author: Student
// ==============================================
//

namespace EVynk.Booking.Api.Models
{
    /// <summary>
    /// Canonical EV Owner document. NIC is mapped to MongoDB _id (string).
    /// </summary>
    [BsonIgnoreExtraElements]
    public class Owner
    {
        /// <summary>
        /// Primary key: NIC (Sri Lanka). Stored as string in _id.
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        [BsonElement("_id")]
        public string Nic { get; set; } = string.Empty;

        /// <summary>
        /// Optional mirror of NIC for readability/search convenience.
        /// Keep identical to Nic/_id.
        /// </summary>
        [BsonElement("nic")]
        public string NicMirror { get; set; } = string.Empty;

        /// <summary>
        /// First name of the EV owner.
        /// </summary>
        [BsonElement("firstName")]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Last name of the EV owner.
        /// </summary>
        [BsonElement("lastName")]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Email (recommended unique, case-insensitive).
        /// </summary>
        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Phone number (E.164 recommended, e.g., +9477XXXXXXX).
        /// </summary>
        [BsonElement("phone")]
        public string Phone { get; set; } = string.Empty;

        /// <summary>
        /// Optional postal address.
        /// </summary>
        [BsonElement("address")]
        public Address? Address { get; set; }

        /// <summary>
        /// Optional vehicle profile.
        /// </summary>
        [BsonElement("vehicle")]
        public Vehicle? Vehicle { get; set; }

        /// <summary>
        /// Account lifecycle status. Active | Deactivated
        /// </summary>
        [BsonElement("status")]
        [BsonRepresentation(BsonType.String)]
        public OwnerStatus Status { get; set; } = OwnerStatus.Active;

        /// <summary>
        /// Timestamp set when status transitions to Deactivated.
        /// </summary>
        [BsonElement("deactivatedAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? DeactivatedAt { get; set; }

        /// <summary>
        /// "self" for self-deactivation, or backoffice user id/email when deactivated by staff.
        /// </summary>
        [BsonElement("deactivatedBy")]
        public string? DeactivatedBy { get; set; }

        /// <summary>
        /// Document creation time (UTC).
        /// </summary>
        [BsonElement("createdAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Last update time (UTC).
        /// </summary>
        [BsonElement("updatedAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Authentication subdocument (server-managed).
        /// </summary>
        [BsonElement("auth")]
        public OwnerAuth Auth { get; set; } = new OwnerAuth();

        /// <summary>
        /// Helper: Normalize fields commonly used in lookups/uniqueness (email casing, NIC mirror).
        /// Call this before insert/update.
        /// </summary>
        public void Normalize()
        {
            // Keep nic mirror in sync
            NicMirror = Nic;

            // Normalize email to lower for consistent unique index (use collation too)
            if (!string.IsNullOrWhiteSpace(Email))
                Email = Email.Trim().ToLowerInvariant();

            // Trim common text fields
            FirstName = FirstName?.Trim() ?? string.Empty;
            LastName  = LastName?.Trim()  ?? string.Empty;
            Phone     = Phone?.Trim()     ?? string.Empty;
        }

        /// <summary>
        /// Business-rule validation (format checks only; data existence checks go in services).
        /// Throws ArgumentException on invalid input.
        /// </summary>
        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(Nic))
                throw new ArgumentException("NIC is required.");

            if (!Regex.IsMatch(Nic, OwnerConstants.NicPattern, RegexOptions.IgnoreCase))
                throw new ArgumentException("NIC format is invalid. Use 9 digits + V/X or 12 digits.");

            if (string.IsNullOrWhiteSpace(FirstName))
                throw new ArgumentException("FirstName is required.");

            if (string.IsNullOrWhiteSpace(LastName))
                throw new ArgumentException("LastName is required.");

            if (string.IsNullOrWhiteSpace(Email))
                throw new ArgumentException("Email is required.");
        }
    }

    /// <summary>
    /// Owner account status per assignment: Active or Deactivated.
    /// Reactivation can only be performed by Backoffice.
    /// </summary>
    public enum OwnerStatus
    {
        Active,
        Deactivated
    }

    /// <summary>
    /// Postal address (all fields optional).
    /// </summary>
    public class Address
    {
        [BsonElement("line1")]
        public string? Line1 { get; set; }

        [BsonElement("line2")]
        public string? Line2 { get; set; }

        [BsonElement("city")]
        public string? City { get; set; }

        [BsonElement("postalCode")]
        public string? PostalCode { get; set; }
    }

    /// <summary>
    /// EV vehicle profile (optional).
    /// </summary>
    public class Vehicle
    {
        [BsonElement("make")]
        public string? Make { get; set; }

        [BsonElement("model")]
        public string? Model { get; set; }

        [BsonElement("plate")]
        public string? Plate { get; set; }

        [BsonElement("batteryKWh")]
        public double? BatteryKWh { get; set; }

        /// <summary>
        /// Supported connector types (e.g., Type2, CCS2, CHAdeMO).
        /// </summary>
        [BsonElement("connectorTypes")]
        public List<string>? ConnectorTypes { get; set; }
    }

    /// <summary>
    /// Authentication subdocument. Password is never stored in plain text.
    /// </summary>
    public class OwnerAuth
    {
        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("passwordSalt")]
        public string? PasswordSalt { get; set; }

        [BsonElement("lastLoginAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? LastLoginAt { get; set; }
    }

    /// <summary>
    /// Constants and helpers for Owner entity.
    /// </summary>
    public static class OwnerConstants
    {
        /// <summary>
        /// Sri Lanka NIC: old format (9 digits + V/X) or new format (12 digits).
        /// </summary>
        public const string NicPattern = @"^(\d{9}[VX]|\d{12})$";

        /// <summary>
        /// Convenience to build an Owner with sensible defaults.
        /// Call Normalize() and Validate() before persisting.
        /// </summary>
        public static Owner Create(string nic,
                                   string firstName,
                                   string lastName,
                                   string email,
                                   string phone,
                                   Address? address = null,
                                   Vehicle? vehicle = null)
        {
            var owner = new Owner
            {
                Nic        = nic?.Trim() ?? string.Empty,
                NicMirror  = nic?.Trim() ?? string.Empty,
                FirstName  = firstName?.Trim() ?? string.Empty,
                LastName   = lastName?.Trim() ?? string.Empty,
                Email      = email?.Trim() ?? string.Empty,
                Phone      = phone?.Trim() ?? string.Empty,
                Address    = address,
                Vehicle    = vehicle,
                Status     = OwnerStatus.Active,
                CreatedAt  = DateTime.UtcNow,
                UpdatedAt  = DateTime.UtcNow,
                Auth       = new OwnerAuth()
            };

            owner.Normalize();
            owner.Validate();
            return owner;
        }
    }
}
