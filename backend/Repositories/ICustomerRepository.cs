namespace Crm.Api.Repositories;
using Crm.Api.Models;

public interface ICustomerRepository
{
    Task<(IEnumerable<Customer> items, int totalCount)> GetCustomersAsync(string search, int page, int pageSize);
    Task<Customer?> GetCustomerByIdAsync(int id);
    Task<Customer> AddCustomerAsync(Customer customer);
    Task<Customer?> UpdateCustomerAsync(Customer customer);
    Task<bool> DeleteCustomerAsync(int id);
    Task<CustomerNote> AddNoteAsync(CustomerNote note);
}
