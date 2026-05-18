namespace Crm.Api.Models;
using System.ComponentModel.DataAnnotations;

public class Lead
{
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public decimal Value { get; set; }
    
    [Required]
    public string Stage { get; set; } = "New Leads";
    
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
