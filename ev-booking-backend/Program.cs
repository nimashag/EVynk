using EVynk.Booking.Api.Config;
using EVynk.Booking.Api.Persistence;
using Microsoft.OpenApi.Models;

// ==============================================
//  Project: EVynk Booking Backend (API)
//  File: Program.cs
//  Created: 2025-10-01
//  Description: Application entry point and host configuration.
//  Author: Student
// ==============================================

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Note: We enable controllers to support attribute-routed controllers.
builder.Services.AddControllers();

// Bind MongoDB settings and register context
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection(MongoDbSettings.SectionName));
builder.Services.AddSingleton<MongoDbContext>();

// Swagger/OpenAPI configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Inline comment at the beginning of method: configuring Swagger generation options
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EVynk Booking API",
        Version = "v1"
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();


