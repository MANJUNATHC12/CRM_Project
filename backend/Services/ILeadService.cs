namespace Crm.Api.Services;
using Crm.Api.DTOs;

public interface ILeadService
{
    Task<IEnumerable<LeadDto>> GetLeadsAsync();
    Task<LeadDto?> GetLeadByIdAsync(int id);
    Task<LeadDto> CreateLeadAsync(CreateLeadDto dto);
    Task<LeadDto?> UpdateLeadAsync(int id, UpdateLeadDto dto);
    Task<bool> DeleteLeadAsync(int id);
}
