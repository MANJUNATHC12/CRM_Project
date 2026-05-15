namespace Crm.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Crm.Api.Data;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _ctx;

    public ReportsController(ApplicationDbContext ctx)
    {
        _ctx = ctx;
    }

    // GET /api/reports/summary — high-level KPIs
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalCustomers  = await _ctx.Customers.CountAsync();
        var activeCustomers = await _ctx.Customers.CountAsync(c => c.Status == "Active");
        var totalLeads      = await _ctx.Leads.CountAsync();
        var wonLeads        = await _ctx.Leads.CountAsync(l => l.Stage == "Won");
        var totalRevenue    = await _ctx.Leads.Where(l => l.Stage == "Won").SumAsync(l => (double)l.Value);
        var pipelineValue   = await _ctx.Leads.Where(l => l.Stage != "Won").SumAsync(l => (double)l.Value);
        var conversionRate  = totalLeads > 0 ? Math.Round((double)wonLeads / totalLeads * 100, 1) : 0;

        return Ok(new
        {
            totalCustomers,
            activeCustomers,
            totalLeads,
            wonLeads,
            totalRevenue,
            pipelineValue,
            conversionRate
        });
    }

    // GET /api/reports/leads-by-stage — for pipeline funnel
    [HttpGet("leads-by-stage")]
    public async Task<IActionResult> GetLeadsByStage()
    {
        var data = await _ctx.Leads
            .GroupBy(l => l.Stage)
            .Select(g => new
            {
                stage = g.Key,
                count = g.Count(),
                value = g.Sum(l => (double)l.Value)
            })
            .ToListAsync();

        // Ensure standard stage order
        var order = new[] { "New Leads", "Contacted", "Qualified", "Proposal", "Won" };
        var ordered = order.Select(s => data.FirstOrDefault(d => d.stage == s) ?? new { stage = s, count = 0, value = 0.0 });
        return Ok(ordered);
    }

    // GET /api/reports/customer-growth — monthly customer registrations
    [HttpGet("customer-growth")]
    public async Task<IActionResult> GetCustomerGrowth()
    {
        var data = await _ctx.Customers
            .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month })
            .Select(g => new
            {
                year  = g.Key.Year,
                month = g.Key.Month,
                count = g.Count()
            })
            .OrderBy(d => d.year).ThenBy(d => d.month)
            .ToListAsync();

        var result = data.Select(d => new
        {
            month = new DateTime(d.year, d.month, 1).ToString("MMM yyyy"),
            customers = d.count
        });
        return Ok(result);
    }

    // GET /api/reports/revenue-over-time — monthly won-deal revenue
    [HttpGet("revenue-over-time")]
    public async Task<IActionResult> GetRevenueOverTime()
    {
        var data = await _ctx.Leads
            .Where(l => l.Stage == "Won")
            .GroupBy(l => new { l.CreatedAt.Year, l.CreatedAt.Month })
            .Select(g => new
            {
                year    = g.Key.Year,
                month   = g.Key.Month,
                revenue = g.Sum(l => (double)l.Value),
                deals   = g.Count()
            })
            .OrderBy(d => d.year).ThenBy(d => d.month)
            .ToListAsync();

        var result = data.Select(d => new
        {
            month   = new DateTime(d.year, d.month, 1).ToString("MMM yyyy"),
            revenue = Math.Round(d.revenue, 2),
            deals   = d.deals
        });
        return Ok(result);
    }

    // GET /api/reports/lead-source-value — total value + count per stage as pie
    [HttpGet("pipeline-summary")]
    public async Task<IActionResult> GetPipelineSummary()
    {
        var data = await _ctx.Leads
            .GroupBy(l => l.Stage)
            .Select(g => new
            {
                name  = g.Key,
                value = Math.Round(g.Sum(l => (double)l.Value), 2),
                count = g.Count()
            })
            .ToListAsync();
        return Ok(data);
    }

    // GET /api/reports/activity-log-summary — actions per day last 14 days
    [HttpGet("activity-summary")]
    public async Task<IActionResult> GetActivitySummary()
    {
        var since = DateTime.UtcNow.AddDays(-14);
        var data = await _ctx.ActivityLogs
            .Where(a => a.CreatedAt >= since)
            .GroupBy(a => a.CreatedAt.Date)
            .Select(g => new { date = g.Key, actions = g.Count() })
            .OrderBy(d => d.date)
            .ToListAsync();

        var result = data.Select(d => new
        {
            date    = d.date.ToString("MMM dd"),
            actions = d.actions
        });
        return Ok(result);
    }
}
