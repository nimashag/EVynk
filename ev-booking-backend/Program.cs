using EVynk.Booking.Api.Config;
using EVynk.Booking.Api.Persistence;
using EVynk.Booking.Api.Repositories;
using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

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
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.AddScoped<AuthService>();

// JWT Authentication
var jwtSecret = builder.Configuration[$"{JwtSettings.SectionName}:Secret"];
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret ?? "development-secret-change-me"));
builder.Services.AddAuthentication(options =>
{
    // Inline comment at the beginning of method: configure JWT bearer defaults
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    // Inline comment at the beginning of method: configure token validation parameters
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration[$"{JwtSettings.SectionName}:Issuer"],
        ValidAudience = builder.Configuration[$"{JwtSettings.SectionName}:Audience"],
        IssuerSigningKey = key
    };
});

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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


