using EVynk.Booking.Api.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EVynk.Booking.Api.Persistence
{
    // ==============================================
    //  Project: EVynk Booking Backend (API)
    //  File: MongoDbContext.cs
    //  Created: 2025-10-01
    //  Description: Minimal MongoDB client/context wrapper for DI.
    //  Author: Student
    // ==============================================

    public class MongoDbContext
    {
        public IMongoDatabase Database { get; }

        public MongoDbContext(IOptions<MongoDbSettings> options)
        {
            // Inline comment at the beginning of method: build client and database from settings
            var client = new MongoClient(options.Value.ConnectionString);
            Database = client.GetDatabase(options.Value.DatabaseName);
        }
    }
}


