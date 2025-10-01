namespace EVynk.Booking.Api.Config
{
    // ==============================================
    //  Project: EVynk Booking Backend (API)
    //  File: MongoDbSettings.cs
    //  Created: 2025-10-01
    //  Description: Strongly-typed configuration for MongoDB connection.
    //  Author: Student
    // ==============================================

    public class MongoDbSettings
    {
        public const string SectionName = "MongoDb";

        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
    }
}


