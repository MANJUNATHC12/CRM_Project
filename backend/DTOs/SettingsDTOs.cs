namespace Crm.Api.DTOs;
using System.Collections.Generic;

public class SettingsGroupDto
{
    public string Group { get; set; } = string.Empty;
    public Dictionary<string, string> Values { get; set; } = new();
}

public class SaveSettingsDto
{
    public string Group { get; set; } = string.Empty;
    public Dictionary<string, string> Values { get; set; } = new();
}
