namespace Crm.Api.Repositories;
using Microsoft.EntityFrameworkCore;
using Crm.Api.Data;
using Crm.Api.Models;
using System.Linq;

public class CustomerRepository : ICustomerRepository
{
    private readonly ApplicationDbContext _context;

    public CustomerRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<Customer> items, int totalCount)> GetCustomersAsync(string search, int page, int pageSize)
    {
        var query = _context.Customers.Include(c => c.Notes).AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(searchLower) || c.Company.ToLower().Contains(searchLower) || c.Email.ToLower().Contains(searchLower) || c.Phone.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(c => c.CreatedAt)
                               .Skip((page - 1) * pageSize)
                               .Take(pageSize)
                               .ToListAsync();
        
        return (items, totalCount);
    }

    public async Task<Customer?> GetCustomerByIdAsync(int id)
    {
        var customer = await _context.Customers.Include(c => c.Notes).FirstOrDefaultAsync(c => c.Id == id);
        if (customer != null && customer.Notes != null)
        {
            customer.Notes = customer.Notes.OrderByDescending(n => n.CreatedAt).ToList();
        }
        return customer;
    }

    public async Task<Customer> AddCustomerAsync(Customer customer)
    {
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return customer;
    }

    public async Task<Customer?> UpdateCustomerAsync(Customer customer)
    {
        _context.Customers.Update(customer);
        await _context.SaveChangesAsync();
        return customer;
    }

    public async Task<bool> DeleteCustomerAsync(int id)
    {
        var customer = await _context.Customers.Include(c => c.Notes).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null) return false;
        
        // Remove related notes first to avoid FK issues
        if (customer.Notes != null && customer.Notes.Any())
        {
            _context.CustomerNotes.RemoveRange(customer.Notes);
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<CustomerNote> AddNoteAsync(CustomerNote note)
    {
        _context.CustomerNotes.Add(note);
        await _context.SaveChangesAsync();
        return note;
    }
}
