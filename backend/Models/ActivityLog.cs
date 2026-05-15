namespace Crm.Api.Models;
using System.ComponentModel.DataAnnotations;

public class ActivityLog
{
    public int Id { get; set; }
    
    [Required]
    public string Action { get; set; } = string.Empty; // e.g. "Created", "Updated", "Deleted"
    
    [Required]
    public string EntityType { get; set; } = string.Empty; // e.g. "Lead", "Customer", "Task"
    
    public int? EntityId { get; set; }
    
    public string Details { get; set; } = string.Empty; // JSON or raw string describing changes
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
