import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '@/services/dashboard';

export default function VisualInsights() {
  const [statistics, setStatistics] = useState<any>(null);
  const [weeklyDonations, setWeeklyDonations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await dashboardService.getRequestStatistics();
        setStatistics(stats);

        const endTime = new Date();
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - 30); // Last 30 days
        
        const donations = await dashboardService.getWeeklyDonations(
          BigInt(startTime.getTime() * 1000000),
          BigInt(endTime.getTime() * 1000000)
        );
        setWeeklyDonations(donations);
      } catch (error) {
        console.error('Error fetching insights:', error);
      }
    };

    fetchData();
  }, []);

  if (!statistics) return null;

  const pieData = [
    { name: 'Pending', value: statistics.totalPending },
    { name: 'Approved', value: statistics.totalApproved },
    { name: 'Rejected', value: statistics.totalRejected },
    { name: 'Completed', value: statistics.totalCompleted },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">Visual Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="h-80">
          <h3 className="text-sm font-medium mb-4">Case Status Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Donations */}
        <div className="h-80">
          <h3 className="text-sm font-medium mb-4">Weekly Donations</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyDonations}>
              <XAxis dataKey="weekStart" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalAmount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
