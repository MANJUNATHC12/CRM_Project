namespace Crm.Api.Services;
using Crm.Api.DTOs;
using Crm.Api.Models;
using Crm.Api.Repositories;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repo;

    public CustomerService(ICustomerRepository repo)
    {
        _repo = repo;
    }

    public async Task<PaginatedResult<CustomerDto>> GetCustomersAsync(string search, int page, int pageSize)
    {
        var (items, totalCount) = await _repo.GetCustomersAsync(search, page, pageSize);
        var dtos = items.Select(MapToDto).ToList();
        
        return new PaginatedResult<CustomerDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            CurrentPage = page,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
    {
        var customer = await _repo.GetCustomerByIdAsync(id);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            Name = dto.Name,
            Company = dto.Company,
            Email = dto.Email,
            Phone = dto.Phone,
            Status = dto.Status
        };
        var created = await _repo.AddCustomerAsync(customer);
        return MapToDto(created);
    }

    public async Task<CustomerDto?> UpdateCustomerAsync(int id, UpdateCustomerDto dto)
    {
        var customer = await _repo.GetCustomerByIdAsync(id);
        if (customer == null) return null;

        customer.Name = dto.Name;
        customer.Company = dto.Company;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;
        customer.Status = dto.Status;

        await _repo.UpdateCustomerAsync(customer);
        return MapToDto(customer);
    }

    public async Task<bool> DeleteCustomerAsync(int id)
    {
        return await _repo.DeleteCustomerAsync(id);
    }

    public async Task<CustomerNoteDto?> AddNoteAsync(int customerId, AddNoteDto dto)
    {
        var customer = await _repo.GetCustomerByIdAsync(customerId);
        if (customer == null) return null;

        var note = new CustomerNote
        {
            Content = dto.Content,
            CustomerId = customerId
        };
        
        var created = await _repo.AddNoteAsync(note);
        return new CustomerNoteDto { Id = created.Id, Content = created.Content, CreatedAt = created.CreatedAt };
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Company = customer.Company,
            Email = customer.Email,
            Phone = customer.Phone,
            Status = customer.Status,
            Notes = customer.Notes?.OrderByDescending(n => n.CreatedAt).Select(n => new CustomerNoteDto
            {
                Id = n.Id,
                Content = n.Content,
                CreatedAt = n.CreatedAt
            }).ToList() ?? new List<CustomerNoteDto>()
        };
    }
}
