namespace Crm.Api.Services;
using Crm.Api.DTOs;

public interface ICustomerService
{
    Task<PaginatedResult<CustomerDto>> GetCustomersAsync(string search, int page, int pageSize);
    Task<CustomerDto?> GetCustomerByIdAsync(int id);
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto);
    Task<CustomerDto?> UpdateCustomerAsync(int id, UpdateCustomerDto dto);
    Task<bool> DeleteCustomerAsync(int id);
    Task<CustomerNoteDto?> AddNoteAsync(int customerId, AddNoteDto dto);
}
