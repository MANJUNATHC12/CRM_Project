using System.Collections.Generic;
using System.Linq;
// using System.Threading.Tasks; // removed to avoid ambiguity
using Microsoft.EntityFrameworkCore;
using Crm.Api.Data;
using System.Threading.Tasks;
using Crm.Api.Models;
using Crm.Api.DTOs;

namespace Crm.Api.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        public NotificationService(ApplicationDbContext context) => _context = context;

        public async System.Threading.Tasks.Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    IsRead = n.IsRead,
                    Type = n.Type,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();
        }

        public async System.Threading.Tasks.Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async System.Threading.Tasks.Task<bool> MarkAsReadAsync(int notificationId, string userId)
        {
            var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
            if (notif == null) return false;
            notif.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async System.Threading.Tasks.Task<bool> MarkAllAsReadAsync(string userId)
        {
            var unread = await _context.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
            foreach (var n in unread) n.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async System.Threading.Tasks.Task CreateNotificationAsync(string userId, string title, string message, string type = "Info")
        {
            var notif = new Crm.Api.Models.Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type
            };
            _context.Notifications.Add(notif);
            await _context.SaveChangesAsync();
        }
    }

    public class ActivityService : IActivityService
    {
        private readonly ApplicationDbContext _context;
        public ActivityService(ApplicationDbContext context) => _context = context;

        public async System.Threading.Tasks.Task<IEnumerable<ActivityLogDto>> GetRecentActivitiesAsync(int limit = 50)
        {
            var logs = await _context.ActivityLogs
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return logs.Select(a => new ActivityLogDto
            {
                Id = a.Id,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Details = a.Details,
                UserId = a.UserId,
                UserName = a.User?.FullName ?? "System",
                CreatedAt = a.CreatedAt
            });
        }

        public async System.Threading.Tasks.Task LogActivityAsync(string userId, string action, string entityType, int? entityId = null, string details = "")
        {
            var log = new Crm.Api.Models.ActivityLog
            {
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details
            };
            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
