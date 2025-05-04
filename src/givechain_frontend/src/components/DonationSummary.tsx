import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard';

export default function DonationSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardService.getDonationSummary();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching donation summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!summary) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Your Donation Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total Donated</p>
          <p className="text-2xl font-bold">{summary.totalDonated} ICP</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Total Contributions</p>
          <p className="text-2xl font-bold">{summary.totalContributions}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Cases Supported</p>
          <p className="text-2xl font-bold">{summary.casesSupported.length}</p>
        </div>
      </div>
    </div>
  );
}
