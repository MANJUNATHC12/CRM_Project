// using System.Threading.Tasks; // removed due to conflict
using Microsoft.EntityFrameworkCore;
using Crm.Api.Data;
using Crm.Api.DTOs;
using System.Collections.Generic;
using Crm.Api.Models;
using System.Linq;

namespace Crm.Api.Services
{
    public interface ISettingsService
    {
        System.Threading.Tasks.Task<SettingsGroupDto> GetGroupAsync(string group);
        System.Threading.Tasks.Task<Dictionary<string, string>> GetAllAsync();
        System.Threading.Tasks.Task SaveGroupAsync(SaveSettingsDto dto);
    }

    public class SettingsService : ISettingsService
    {
        private readonly ApplicationDbContext _ctx;
        private static readonly Dictionary<string, string> _defaults = new()
        {
            ["company.name"] = "NexusCRM",
            ["company.email"] = "contact@nexuscrm.io",
            ["company.phone"] = "",
            ["company.address"] = "",
            ["company.website"] = "",
            ["company.timezone"] = "UTC",
            ["smtp.host"] = "",
            ["smtp.port"] = "587",
            ["smtp.username"] = "",
            ["smtp.password"] = "",
            ["smtp.from_name"] = "NexusCRM",
            ["smtp.from_email"] = "",
            ["smtp.use_tls"] = "true",
            ["security.mfa_enabled"] = "false",
            ["security.session_timeout"] = "60",
            ["security.password_min_length"] = "8",
            ["security.login_attempts"] = "5",
            ["notifications.email_alerts"] = "true",
            ["notifications.lead_updates"] = "true",
            ["notifications.task_reminders"] = "true",
            ["notifications.digest_email"] = "false",
            ["preferences.language"] = "en",
            ["preferences.date_format"] = "MM/DD/YYYY",
            ["preferences.currency"] = "USD",
            ["preferences.theme"] = "light",
            ["api.key"] = "",
            ["api.webhook_url"] = "",
            ["billing.plan"] = "Free",
            ["billing.billing_email"] = "",
            ["backup.auto_backup"] = "true",
            ["backup.frequency"] = "daily",
            ["backup.retention_days"] = "30",
        };

        public SettingsService(ApplicationDbContext ctx) => _ctx = ctx;

        public async System.Threading.Tasks.Task<SettingsGroupDto> GetGroupAsync(string group)
        {
            var dbSettings = await _ctx.Settings.Where(s => s.Group == group).ToListAsync();
            var values = new Dictionary<string, string>();
            foreach (var kv in _defaults.Where(d => d.Key.StartsWith(group + ".")))
            {
                var shortKey = kv.Key.Substring(group.Length + 1);
                var dbVal = dbSettings.FirstOrDefault(s => s.Key == shortKey);
                values[shortKey] = dbVal?.Value ?? kv.Value;
            }
            return new SettingsGroupDto { Group = group, Values = values };
        }

        public async System.Threading.Tasks.Task<Dictionary<string, string>> GetAllAsync()
        {
            var dbSettings = await _ctx.Settings.ToListAsync();
            var result = new Dictionary<string, string>(_defaults);
            foreach (var s in dbSettings)
            {
                var fullKey = $"{s.Group}.{s.Key}";
                result[fullKey] = s.Value;
            }
            return result;
        }

        public async System.Threading.Tasks.Task SaveGroupAsync(SaveSettingsDto dto)
        {
            foreach (var kv in dto.Values)
            {
                var existing = await _ctx.Settings.FirstOrDefaultAsync(s => s.Group == dto.Group && s.Key == kv.Key);
                if (existing != null)
                {
                    existing.Value = kv.Value;
                }
                else
                {
                    _ctx.Settings.Add(new Setting { Group = dto.Group, Key = kv.Key, Value = kv.Value });
                }
            }
            await _ctx.SaveChangesAsync();
        }
    }
}
