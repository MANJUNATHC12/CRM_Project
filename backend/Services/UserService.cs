namespace Crm.Api.Services;
using Crm.Api.DTOs;
using Crm.Api.Models;
using Crm.Api.Repositories;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;

    public UserService(IUserRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _repo.GetAllUsersAsync();
        var dtos = new List<UserDto>();
        foreach(var u in users) {
             var roles = await _repo.GetRolesAsync(u);
             dtos.Add(new UserDto { Id = u.Id, FullName = u.FullName, Email = u.Email!, Roles = roles });
        }
        return dtos;
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
        var u = await _repo.GetUserByIdAsync(id);
        if (u == null) return null;
        var roles = await _repo.GetRolesAsync(u);
        return new UserDto { Id = u.Id, FullName = u.FullName, Email = u.Email!, Roles = roles };
    }

    public async Task<bool> CreateUserAsync(CreateUserDto dto)
    {
        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, FullName = dto.FullName };
        var created = await _repo.CreateUserAsync(user, dto.Password);
        if(created && !string.IsNullOrEmpty(dto.Role))
        {
            await _repo.AssignRoleAsync(user, dto.Role);
        }
        return created;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var u = await _repo.GetUserByIdAsync(id);
        if (u == null) return false;
        return await _repo.DeleteUserAsync(u);
    }

    public async Task<bool> AssignRoleAsync(AssignRoleDto dto)
    {
        var u = await _repo.GetUserByIdAsync(dto.UserId);
        if (u == null) return false;
        return await _repo.AssignRoleAsync(u, dto.Role);
    }
}
