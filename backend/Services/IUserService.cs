namespace Crm.Api.Services;
using Crm.Api.DTOs;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto?> GetUserByIdAsync(string id);
    Task<bool> CreateUserAsync(CreateUserDto dto);
    Task<bool> DeleteUserAsync(string id);
    Task<bool> AssignRoleAsync(AssignRoleDto dto);
}
