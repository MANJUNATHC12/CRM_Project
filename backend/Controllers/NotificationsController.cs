namespace Crm.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Crm.Api.Services;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        try 
        {
            var notifications = await _notificationService.GetUserNotificationsAsync(GetUserId());
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving notifications", details = ex.Message });
        }
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        try 
        {
            var count = await _notificationService.GetUnreadCountAsync(GetUserId());
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving count", details = ex.Message });
        }
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var success = await _notificationService.MarkAsReadAsync(id, GetUserId());
        if (!success) return NotFound(new { message = "Notification not found." });
        return Ok(new { message = "Marked as read." });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(GetUserId());
        return Ok(new { message = "All marked as read." });
    }
}
