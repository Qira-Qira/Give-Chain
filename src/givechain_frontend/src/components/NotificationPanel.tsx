import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await dashboardService.getUserNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    // Polling setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <p className="text-sm font-medium">{notification.eventType}</p>
            <p className="text-sm text-gray-600">{notification.details}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(Number(notification.timestamp) / 1000000).toLocaleString()}
            </p>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-gray-500 text-center py-4">No notifications</p>
        )}
      </div>
    </div>
  );
}
