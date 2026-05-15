namespace Crm.Api.Repositories;
using Microsoft.EntityFrameworkCore;
using Crm.Api.Data;
using Crm.Api.Models;

public class LeadRepository : ILeadRepository
{
    private readonly ApplicationDbContext _context;

    public LeadRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Lead>> GetLeadsAsync()
    {
        return await _context.Leads.OrderByDescending(l => l.CreatedAt).ToListAsync();
    }

    public async Task<Lead?> GetLeadByIdAsync(int id)
    {
        return await _context.Leads.FindAsync(id);
    }

    public async Task<Lead> AddLeadAsync(Lead lead)
    {
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();
        return lead;
    }

    public async Task<Lead?> UpdateLeadAsync(Lead lead)
    {
        _context.Leads.Update(lead);
        await _context.SaveChangesAsync();
        return lead;
    }

    public async Task<bool> DeleteLeadAsync(int id)
    {
        var lead = await _context.Leads.FindAsync(id);
        if (lead == null) return false;
        
        _context.Leads.Remove(lead);
        await _context.SaveChangesAsync();
        return true;
    }
}
