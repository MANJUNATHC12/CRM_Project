namespace Crm.Api.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Crm.Api.Models;

public class UserRepository : IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    
    public UserRepository(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<IEnumerable<ApplicationUser>> GetAllUsersAsync() => await _userManager.Users.ToListAsync();
    
    public async Task<ApplicationUser?> GetUserByIdAsync(string id) => await _userManager.FindByIdAsync(id);
    
    public async Task<bool> CreateUserAsync(ApplicationUser user, string password)
    {
        var result = await _userManager.CreateAsync(user, password);
        return result.Succeeded;
    }

    public async Task<bool> DeleteUserAsync(ApplicationUser user)
    {
        var result = await _userManager.DeleteAsync(user);
        return result.Succeeded;
    }

    public async Task<IList<string>> GetRolesAsync(ApplicationUser user) => await _userManager.GetRolesAsync(user);

    public async Task<bool> AssignRoleAsync(ApplicationUser user, string roleName)
    {
        if (!await _userManager.IsInRoleAsync(user, roleName))
        {
            var result = await _userManager.AddToRoleAsync(user, roleName);
            return result.Succeeded;
        }
        return true;
    }
}
