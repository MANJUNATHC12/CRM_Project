namespace Crm.Api.DTOs;
using System.ComponentModel.DataAnnotations;

public class LeadDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Stage { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateLeadDto
{
    [Required(ErrorMessage = "Title is required")]
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    [Range(0, double.MaxValue, ErrorMessage = "Value must be positive")]
    public decimal Value { get; set; }
    public string Stage { get; set; } = "New";
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class UpdateLeadDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public decimal Value { get; set; }
    [Required]
    public string Stage { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
