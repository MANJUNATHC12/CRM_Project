namespace Crm.Api.Repositories;
using Crm.Api.Models;

public interface ILeadRepository
{
    Task<IEnumerable<Lead>> GetLeadsAsync();
    Task<Lead?> GetLeadByIdAsync(int id);
    Task<Lead> AddLeadAsync(Lead lead);
    Task<Lead?> UpdateLeadAsync(Lead lead);
    Task<bool> DeleteLeadAsync(int id);
}
