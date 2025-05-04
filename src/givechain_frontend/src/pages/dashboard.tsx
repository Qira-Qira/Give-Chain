import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Modal from '@/components/Modal';
import StatusBadge, { getStatusText } from '@/components/StatusBadge';
import SubmitCaseForm from '@/components/SubmitCaseForm';
import CaseDetailModal from '@/components/CaseDetailModal';
import { dashboardService } from '@/services/dashboard';
import Link from 'next/link';
import type { Request, RequestStatus } from '../../../declarations/givechain_backend/givechain_backend.did';

export default function DashboardPage() {
  const router = useRouter();
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [principal, setPrincipal] = useState<string>('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const storedPrincipal = localStorage.getItem('userPrincipal');
    if (!storedPrincipal) {
      router.push('/login');
      return;
    }

    setPrincipal(storedPrincipal);
    loadUserRequests(storedPrincipal);
  }, [router]);

  const loadUserRequests = async (userPrincipal: string) => {
    try {
      setLoading(true);
      const requests = await dashboardService.getUserRequests(userPrincipal);
      setUserRequests(requests);
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('Failed to load requests: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const refreshRequests = async () => {
    const userPrincipal = localStorage.getItem('userPrincipal');
    if (userPrincipal) {
      await loadUserRequests(userPrincipal);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userPrincipal');
    router.replace('/login');
  };

  const filteredRequests = userRequests.filter(request => {
    if (statusFilter === 'all') return true;
    return getStatusText(request.status) === statusFilter;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit New Case
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <p className="text-gray-600">Principal ID: {principal}</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Cases List */}
        <div className="bg-white rounded-lg shadow">
          {filteredRequests.length === 0 ? (
            <p className="p-6 text-gray-500">No cases submitted yet.</p>
          ) : (
            filteredRequests.map((request) => (
              <div 
                key={request.id.toString()} 
                className="p-6 border-b cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{request.title}</h3>
                    <StatusBadge status={request.status} />
                    <p className="mt-2 text-gray-600">
                      Amount: {request.amountRequested.toString()} ICP
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Votes: {request.votesFor.toString()} / {request.votesAgainst.toString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submit Case Modal */}
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Submit New Case"
        >
          <SubmitCaseForm
            onSuccess={() => {
              loadUserRequests(principal);
              setIsSubmitModalOpen(false);
            }}
            onClose={() => setIsSubmitModalOpen(false)}
          />
        </Modal>

        {/* Case Detail Modal */}
        {selectedRequest && (
          <CaseDetailModal
            isOpen={!!selectedRequest}
            onClose={() => setSelectedRequest(null)}
            request={selectedRequest}
            onUpdate={refreshRequests}
          />
        )}
      </div>
    </div>
  );
}
