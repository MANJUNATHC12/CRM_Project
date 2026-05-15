namespace Crm.Api.Services;
using Crm.Api.DTOs;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task<bool> MarkAsReadAsync(int notificationId, string userId);
    Task<bool> MarkAllAsReadAsync(string userId);
    Task CreateNotificationAsync(string userId, string title, string message, string type = "Info");
}

public interface IActivityService
{
    Task<IEnumerable<ActivityLogDto>> GetRecentActivitiesAsync(int limit = 50);
    Task LogActivityAsync(string userId, string action, string entityType, int? entityId = null, string details = "");
}
