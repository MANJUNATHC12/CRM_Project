namespace Crm.Api.DTOs;
using System.ComponentModel.DataAnnotations;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public IList<string> Roles { get; set; } = new List<string>();
}

public class CreateUserDto
{
    [Required] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Sales";
}

public class AssignRoleDto
{
    [Required] public string UserId { get; set; } = string.Empty;
    [Required] public string Role { get; set; } = string.Empty;
}
