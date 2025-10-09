using EVynk.Booking.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace EVynk.Booking.Api.Controllers
{
    [ApiController]
    [Route("api/public/stations")]
    // If you want this open to anyone, swap to [AllowAnonymous]
    [Authorize(Roles = "Owner,Backoffice,StationOperator")]
    public class PublicStationsController : ControllerBase
    {
        private readonly ChargingStationService _service;

        public PublicStationsController(ChargingStationService service)
        {
            _service = service;
        }

        // ******** DTOs (read-only, safe to expose) ********
        public record StationListDto(
            string Id,
            string DisplayName,
            string Location,
            string Address,
            string Type,         // "AC"/"DC"
            int AvailableSlots
        );

        public record StationDetailsDto(
            string Id,
            string DisplayName,
            string Location,
            string Address,
            double? Lat,
            double? Lng,
            string Type,         // "AC"/"DC"
            int AvailableSlots,
            bool IsActive
        );

        // ******** Helpers ********
        private static string BuildDisplayName(string location, string address, string type)
        {
            // Order of preference: Location + Address + Type tag
            var core = string.IsNullOrWhiteSpace(location)
                ? (string.IsNullOrWhiteSpace(address) ? "(Unnamed Station)" : address.Trim())
                : location.Trim();

            // Append address if both exist and are different
            if (!string.IsNullOrWhiteSpace(location) && !string.IsNullOrWhiteSpace(address) &&
                !location.Trim().Equals(address.Trim(), System.StringComparison.OrdinalIgnoreCase))
            {
                core = $"{location.Trim()} — {address.Trim()}";
            }

            // Add a short type tag (AC/DC)
            return $"{core} [{type}]";
        }

        /// GET /api/public/stations
        /// Query: ?q= (search by location/address), ?page=1, ?pageSize=50
        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] string? q,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 200) pageSize = 50;

            var all = await _service.ListAsync();

            // Only active stations for end-users
            var query = all.Where(s => s.IsActive);

            if (!string.IsNullOrWhiteSpace(q))
            {
                q = q.Trim();
                query = query.Where(s =>
                    (s.Location ?? "").Contains(q, System.StringComparison.OrdinalIgnoreCase) ||
                    (s.Address  ?? "").Contains(q, System.StringComparison.OrdinalIgnoreCase));
            }

            var total = query.Count();

            var items = query
                .OrderBy(s => s.Location ?? s.Address) // stable ordering
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s =>
                {
                    var type = s.Type.ToString(); // "AC" / "DC"
                    var display = BuildDisplayName(s.Location ?? "", s.Address ?? "", type);
                    return new StationListDto(
                        s.Id,
                        display,
                        s.Location ?? "",
                        s.Address ?? "",
                        type,
                        s.AvailableSlots
                    );
                })
                .ToList();

            return Ok(new
            {
                message = "Active charging stations fetched successfully",
                page,
                pageSize,
                total,
                data = items
            });
        }

        /// GET /api/public/stations/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] string id)
        {
            var all = await _service.ListAsync();
            var s = all.FirstOrDefault(x => x.Id == id && x.IsActive);
            if (s == null)
                return NotFound(new { message = "Charging station not found or inactive." });

            var type = s.Type.ToString();
            var dto = new StationDetailsDto(
                s.Id,
                BuildDisplayName(s.Location ?? "", s.Address ?? "", type),
                s.Location ?? "",
                s.Address ?? "",
                s.Lat,
                s.Lng,
                type,
                s.AvailableSlots,
                s.IsActive
            );

            return Ok(new { message = "Charging station fetched successfully", data = dto });
        }

        /// GET /api/public/stations/suggestions
        /// Lightweight list for dropdowns/autocomplete (id + displayName only)
        /// Query: ?q=, ?limit=20
        [HttpGet("suggestions")]
        public async Task<IActionResult> Suggestions(
            [FromQuery] string? q,
            [FromQuery] int limit = 20)
        {
            if (limit <= 0 || limit > 100) limit = 20;

            var all = await _service.ListAsync();
            var query = all.Where(s => s.IsActive);

            if (!string.IsNullOrWhiteSpace(q))
            {
                q = q.Trim();
                query = query.Where(s =>
                    (s.Location ?? "").Contains(q, System.StringComparison.OrdinalIgnoreCase) ||
                    (s.Address  ?? "").Contains(q, System.StringComparison.OrdinalIgnoreCase));
            }

            var items = query
                .OrderBy(s => s.Location ?? s.Address)
                .Take(limit)
                .Select(s => new
                {
                    id = s.Id,
                    displayName = BuildDisplayName(s.Location ?? "", s.Address ?? "", s.Type.ToString())
                })
                .ToList();

            return Ok(new
            {
                message = "Suggestions fetched successfully",
                data = items
            });
        }
    }
}
