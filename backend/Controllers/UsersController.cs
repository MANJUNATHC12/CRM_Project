namespace Crm.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Crm.Api.DTOs;
using Crm.Api.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // Requires Admin privileges
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var success = await _userService.CreateUserAsync(dto);
        if (success) return Ok(new { message = "User created." });
        return BadRequest(new { message = "Failed to create user." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var success = await _userService.DeleteUserAsync(id);
        if (success) return Ok(new { message = "User deleted." });
        return BadRequest(new { message = "Failed to delete user." });
    }

    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto dto)
    {
        var success = await _userService.AssignRoleAsync(dto);
        if (success) return Ok(new { message = "Role assigned." });
        return BadRequest(new { message = "Failed to assign role." });
    }
}
