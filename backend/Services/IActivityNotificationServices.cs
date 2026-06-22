namespace Crm.Api.Services;

using Crm.Api.DTOs;
// using SystemTask = System.Threading.Tasks.Task; // removed to avoid conflict

public interface INotificationService
{
    System.Threading.Tasks.Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId);
    System.Threading.Tasks.Task<int> GetUnreadCountAsync(string userId);
    System.Threading.Tasks.Task<bool> MarkAsReadAsync(int notificationId, string userId);
    System.Threading.Tasks.Task<bool> MarkAllAsReadAsync(string userId);
    System.Threading.Tasks.Task CreateNotificationAsync(string userId, string title, string message, string type = "Info");
}

public interface IActivityService
{
    System.Threading.Tasks.Task<IEnumerable<ActivityLogDto>> GetRecentActivitiesAsync(int limit = 50);
    System.Threading.Tasks.Task LogActivityAsync(string userId, string action, string entityType, int? entityId = null, string details = "");
}
