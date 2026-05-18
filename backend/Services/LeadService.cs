namespace Crm.Api.Services;
using Crm.Api.DTOs;
using Crm.Api.Models;
using Crm.Api.Repositories;

public class LeadService : ILeadService
{
    private readonly ILeadRepository _repo;

    public LeadService(ILeadRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<LeadDto>> GetLeadsAsync()
    {
        var items = await _repo.GetLeadsAsync();
        return items.Select(MapToDto);
    }

    public async Task<LeadDto?> GetLeadByIdAsync(int id)
    {
        var lead = await _repo.GetLeadByIdAsync(id);
        return lead == null ? null : MapToDto(lead);
    }

    public async Task<LeadDto> CreateLeadAsync(CreateLeadDto dto)
    {
        var lead = new Lead
        {
            Title = dto.Title,
            Company = dto.Company,
            Value = dto.Value,
            Stage = dto.Stage,
            Email = dto.Email ?? string.Empty,
            Phone = dto.Phone ?? string.Empty
        };
        var created = await _repo.AddLeadAsync(lead);
        return MapToDto(created);
    }

    public async Task<LeadDto?> UpdateLeadAsync(int id, UpdateLeadDto dto)
    {
        var lead = await _repo.GetLeadByIdAsync(id);
        if (lead == null) return null;

        lead.Title = dto.Title;
        lead.Company = dto.Company;
        lead.Value = dto.Value;
        lead.Stage = dto.Stage;
        lead.Email = dto.Email ?? string.Empty;
        lead.Phone = dto.Phone ?? string.Empty;

        await _repo.UpdateLeadAsync(lead);
        return MapToDto(lead);
    }

    public async Task<bool> DeleteLeadAsync(int id)
    {
        return await _repo.DeleteLeadAsync(id);
    }

    private static LeadDto MapToDto(Lead lead)
    {
        return new LeadDto
        {
            Id = lead.Id,
            Title = lead.Title,
            Company = lead.Company,
            Value = lead.Value,
            Stage = lead.Stage,
            Email = lead.Email,
            Phone = lead.Phone,
            CreatedAt = lead.CreatedAt
        };
    }
}
