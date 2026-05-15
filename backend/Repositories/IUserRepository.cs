namespace Crm.Api.Repositories;
using Crm.Api.Models;

public interface IUserRepository
{
    Task<IEnumerable<ApplicationUser>> GetAllUsersAsync();
    Task<ApplicationUser?> GetUserByIdAsync(string id);
    Task<bool> CreateUserAsync(ApplicationUser user, string password);
    Task<bool> DeleteUserAsync(ApplicationUser user);
    Task<IList<string>> GetRolesAsync(ApplicationUser user);
    Task<bool> AssignRoleAsync(ApplicationUser user, string roleName);
}
