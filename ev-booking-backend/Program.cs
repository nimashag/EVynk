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
//  Created: 2025-10-07
//  Description: Application entry point and host configuration.
//               Registers Mongo, JWT, services, and controllers.
//  Author: Student
// ==============================================

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// 1. Controller and basic services
// ---------------------------------------------------------------------------
builder.Services.AddControllers();

// ---------------------------------------------------------------------------
// 2. CORS (for frontend + mobile debugging)
// ---------------------------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ---------------------------------------------------------------------------
// 3. MongoDB setup
// ---------------------------------------------------------------------------
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection(MongoDbSettings.SectionName));
builder.Services.AddSingleton<MongoDbContext>();

// ---------------------------------------------------------------------------
// 4. Dependency Injection (Repositories + Services)
// ---------------------------------------------------------------------------
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddScoped<IOwnerRepository, OwnerRepository>();
builder.Services.AddScoped<OwnerService>();

builder.Services.AddScoped<IChargingStationRepository, ChargingStationRepository>();
builder.Services.AddScoped<ChargingStationService>();

builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<BookingService>();

builder.Services.AddHttpContextAccessor();

// ---------------------------------------------------------------------------
// 5. JWT Authentication (shared for Backoffice, Operators, Owners)
// ---------------------------------------------------------------------------

// ✅ Aligns with your appsettings.json:
// "Jwt": { "Key": "...", "Issuer": "...", "Audience": "...", "ExpiryMinutes": 120 }
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey ?? "development-secret-change-me"));

builder.Services.AddAuthentication(options =>
{
    // configure JWT bearer defaults
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // configure token validation parameters
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = key,
        ClockSkew = TimeSpan.Zero // prevents minor timing errors
    };
});

// ---------------------------------------------------------------------------
// 6. Swagger / OpenAPI (with JWT support)
// ---------------------------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EVynk Booking API",
        Version = "v1",
        Description = "EV Charging Booking System (Web + Mobile)"
    });

    // Add JWT bearer auth to Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter JWT token (without 'Bearer ' prefix)",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ---------------------------------------------------------------------------
// 7. Build + Middleware pipeline
// ---------------------------------------------------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

// Authentication + Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
