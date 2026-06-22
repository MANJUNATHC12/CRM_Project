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

    // GET /api/reports/dashboard/kpis — KPI values for dashboard
[HttpGet("dashboard/kpis")]
public async Task<IActionResult> GetDashboardKpis()
{
    var totalLeads = await _ctx.Leads.CountAsync();
    var totalRevenue = await _ctx.Leads.Where(l => l.Stage == "Won").SumAsync(l => (double)l.Value);
    var lostLeads = await _ctx.Leads.CountAsync(l => l.Stage == "Lost");
    var wonLeads = await _ctx.Leads.CountAsync(l => l.Stage == "Won");
    var upcomingDeadlines = await _ctx.Leads.CountAsync(l => l.Deadline != null && l.Deadline > DateTime.UtcNow && l.Deadline <= DateTime.UtcNow.AddDays(7));

    return Ok(new
    {
        totalLeads,
        totalRevenue,
        lostLeads,
        wonLeads,
        upcomingDeadlines
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
        var order = new[] { "New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost" };
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

    // GET /api/reports/lead-analytics — advanced lead dashboard metrics
    [HttpGet("lead-analytics")]
    public async Task<IActionResult> GetLeadAnalytics()
    {
        var allLeads = await _ctx.Leads.ToListAsync();
        
        var wonCount = allLeads.Count(l => l.Stage == "Won");
        var lostCount = allLeads.Count(l => l.Stage == "Lost");
        var openCount = allLeads.Count(l => l.Stage != "Won" && l.Stage != "Lost");

        // Calculate Revenue Forecast based on Pipeline Probabilities
        var forecast = allLeads.Where(l => l.Stage != "Won" && l.Stage != "Lost")
            .Sum(l => 
                l.Stage == "New" ? (double)l.Value * 0.1 :
                l.Stage == "Contacted" ? (double)l.Value * 0.3 :
                l.Stage == "Qualified" ? (double)l.Value * 0.5 :
                l.Stage == "Proposal Sent" ? (double)l.Value * 0.7 :
                l.Stage == "Negotiation" ? (double)l.Value * 0.85 :
                (double)l.Value * 0.2);

        // Mocked Performance & Sources until full DB migration handles these fields
        var performance = new[] {
            new { name = "Sarah Jenkins", won = 120000, pipeline = 450000 },
            new { name = "Mike Ross", won = 85000, pipeline = 320000 },
            new { name = "David Chen", won = 150000, pipeline = 200000 }
        };

        var sources = new[] {
            new { name = "Organic Search", value = 45 },
            new { name = "Client Referral", value = 25 },
            new { name = "Cold Outreach", value = 20 },
            new { name = "Social Media", value = 10 }
        };

        var wonVsLost = new[] {
            new { name = "Won Deals", value = wonCount, fill = "#10b981" },
            new { name = "Lost Deals", value = lostCount, fill = "#ef4444" },
            new { name = "Open Pipeline", value = openCount, fill = "#3b82f6" }
        };

        return Ok(new {
            wonVsLost,
            forecast = Math.Round(forecast, 2),
            performance,
            sources
        });
    }
}
