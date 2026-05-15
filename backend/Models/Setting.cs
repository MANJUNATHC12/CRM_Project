namespace Crm.Api.Models;
using System.ComponentModel.DataAnnotations;

public class Setting
{
    public int Id { get; set; }

    [Required]
    public string Key { get; set; } = string.Empty;  // e.g. "company.name"
    public string Value { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty; // e.g. "company", "smtp", "security"
}
