namespace Crm.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Crm.Api.DTOs;
using Crm.Api.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _svc;
    public SettingsController(ISettingsService svc) => _svc = svc;

    // GET /api/settings?group=company
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string group = "")
    {
        try
        {
            if (!string.IsNullOrEmpty(group))
            {
                var result = await _svc.GetGroupAsync(group);
                return Ok(result);
            }
            var all = await _svc.GetAllAsync();
            return Ok(all);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // POST /api/settings  (Admin only to save)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Save([FromBody] SaveSettingsDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            await _svc.SaveGroupAsync(dto);
            return Ok(new { message = "Settings saved." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
