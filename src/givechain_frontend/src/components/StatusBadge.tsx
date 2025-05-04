import { RequestStatus } from '../../../declarations/givechain_backend/givechain_backend.did';

interface StatusBadgeProps {
  status: RequestStatus;
}

const statusStyles = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

export function getStatusText(status: RequestStatus): string {
  if ('Pending' in status) return 'Pending';
  if ('Approved' in status) return 'Approved';
  if ('Rejected' in status) return 'Rejected';
  if ('Completed' in status) return 'Completed';
  return 'Unknown';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusText = getStatusText(status);
  return (
    <span className={`px-2 py-1 text-sm font-medium rounded-full border ${statusStyles[statusText]}`}>
      {statusText}
    </span>
  );
}
