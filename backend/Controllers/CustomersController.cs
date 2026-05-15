namespace Crm.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Crm.Api.DTOs;
using Crm.Api.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Requires login
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly IActivityService _activityService;

    public CustomersController(ICustomerService customerService, IActivityService activityService)
    {
        _customerService = customerService;
        _activityService = activityService;
    }

    private string GetUserId() => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";

    [HttpGet]
    public async Task<IActionResult> GetCustomers([FromQuery] string search = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try 
        {
            var result = await _customerService.GetCustomersAsync(search, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving customers", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomer(int id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);
        if (customer == null) return NotFound(new { message = "Customer not found." });
        return Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var created = await _customerService.CreateCustomerAsync(dto);
            await _activityService.LogActivityAsync(GetUserId(), "Created", "Customer", created.Id, $"Added customer: {created.Name}");
            return CreatedAtAction(nameof(GetCustomer), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating customer", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var updated = await _customerService.UpdateCustomerAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Customer not found." });
            await _activityService.LogActivityAsync(GetUserId(), "Updated", "Customer", id, $"Updated details for {updated.Name}");
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating customer", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        try 
        {
            var success = await _customerService.DeleteCustomerAsync(id);
            if (!success) return NotFound(new { message = "Customer not found." });
            return Ok(new { message = "Customer deleted successfully." });
        }
        catch (Exception ex)
        {
             return StatusCode(500, new { message = "Error deleting customer", details = ex.Message });
        }
    }

    [HttpPost("{id}/notes")]
    public async Task<IActionResult> AddNote(int id, [FromBody] AddNoteDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var note = await _customerService.AddNoteAsync(id, dto);
            if (note == null) return NotFound(new { message = "Customer not found." });
            return Ok(note);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error adding note", details = ex.Message });
        }
    }
}
