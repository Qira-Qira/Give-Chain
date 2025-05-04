import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard';

export default function AuditLogViewer() {
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    eventType: '',
    startTime: '',
    endTime: '',
    userPrincipal: ''
  });

  const fetchAuditLog = async () => {
    try {
      const logs = await dashboardService.getStructuredAuditLog({
        eventType: filters.eventType || null,
        startTime: filters.startTime ? BigInt(new Date(filters.startTime).getTime() * 1000000) : null,
        endTime: filters.endTime ? BigInt(new Date(filters.endTime).getTime() * 1000000) : null,
        userPrincipal: filters.userPrincipal || null
      });
      setAuditLog(logs);
    } catch (error) {
      console.error('Error fetching audit log:', error);
    }
  };

  useEffect(() => {
    fetchAuditLog();
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">Audit Log</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Event Type"
          className="border rounded p-2"
          value={filters.eventType}
          onChange={e => setFilters({...filters, eventType: e.target.value})}
        />
        <input
          type="datetime-local"
          className="border rounded p-2"
          value={filters.startTime}
          onChange={e => setFilters({...filters, startTime: e.target.value})}
        />
        <input
          type="datetime-local"
          className="border rounded p-2"
          value={filters.endTime}
          onChange={e => setFilters({...filters, endTime: e.target.value})}
        />
        <input
          type="text"
          placeholder="User Principal"
          className="border rounded p-2"
          value={filters.userPrincipal}
          onChange={e => setFilters({...filters, userPrincipal: e.target.value})}
        />
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLog.map((log, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(Number(log.timestamp) / 1000000).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {log.eventType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.user.toString().substring(0, 10)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
