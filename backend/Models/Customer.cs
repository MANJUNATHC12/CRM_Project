namespace Crm.Api.Models;
using System.ComponentModel.DataAnnotations;

public class Customer
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string Company { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    
    public string Status { get; set; } = "Active"; // Active, Inactive, Lead
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<CustomerNote> Notes { get; set; } = new List<CustomerNote>();
}

public class CustomerNote
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}
