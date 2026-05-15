namespace Crm.Api.Models;
using System.ComponentModel.DataAnnotations;

public class Notification
{
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public string Message { get; set; } = string.Empty;
    
    public bool IsRead { get; set; } = false;
    
    public string Type { get; set; } = "Info"; // Info, Alert, Success, Reminder
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
