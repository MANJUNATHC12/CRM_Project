namespace Crm.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Crm.Api.DTOs;
using Crm.Api.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Requires login
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;
    private readonly IActivityService _activityService;
    private readonly INotificationService _notificationService;

    public LeadsController(ILeadService leadService, IActivityService activityService, INotificationService notificationService)
    {
        _leadService = leadService;
        _activityService = activityService;
        _notificationService = notificationService;
    }

    private string GetUserId() => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";

    [HttpGet]
    public async Task<IActionResult> GetLeads()
    {
        try 
        {
            var result = await _leadService.GetLeadsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving leads", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLead(int id)
    {
        var lead = await _leadService.GetLeadByIdAsync(id);
        if (lead == null) return NotFound(new { message = "Lead not found." });
        return Ok(lead);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLead([FromBody] CreateLeadDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var created = await _leadService.CreateLeadAsync(dto);
            try { await _activityService.LogActivityAsync(GetUserId(), "Created", "Lead", created.Id, $"New lead added for {created.Company}"); } catch { /* Ignore activity errors */ }
            return CreatedAtAction(nameof(GetLead), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating lead", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLead(int id, [FromBody] UpdateLeadDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var updated = await _leadService.UpdateLeadAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Lead not found." });
            // Log activity
            try { await _activityService.LogActivityAsync(GetUserId(), "Updated", "Lead", id, $"Moved lead to {updated.Stage}"); } catch { /* Ignore activity errors */ }
            // Send notification if lead is marked as Lost
            if (updated.Stage.Equals("Lost", StringComparison.OrdinalIgnoreCase))
            {
                try { await _notificationService.CreateNotificationAsync(GetUserId(), "Lead Lost", $"Lead {updated.Title} was marked as Lost.", "Warning"); } catch { /* Ignore notification errors */ }
            }
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating lead", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLead(int id)
    {
        try 
        {
            var success = await _leadService.DeleteLeadAsync(id);
            if (!success) return NotFound(new { message = "Lead not found." });
            return Ok(new { message = "Lead deleted successfully." });
        }
        catch (Exception ex)
        {
             return StatusCode(500, new { message = "Error deleting lead", details = ex.Message });
        }
    }
}
