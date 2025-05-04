import { useState } from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { Request } from '../../../declarations/givechain_backend/givechain_backend.did';
import { dashboardService } from '@/services/dashboard';

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request;
  onUpdate: () => void;
}

export default function CaseDetailModal({ isOpen, onClose, request, onUpdate }: CaseDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: request.title,
    description: request.description,
    category: request.category,
    proofUrl: request.proofUrl
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isPending = 'Pending' in request.status;
  const canEdit = isPending && request.votesFor === BigInt(0) && request.votesAgainst === BigInt(0);

  const handleSave = async () => {
    if (!canEdit) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      await dashboardService.updateCaseRequest(
        request.id,
        editData.title,
        editData.description,
        editData.category,
        editData.proofUrl
      );
      onUpdate();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Case" : "Case Details"}>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-start">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={e => setEditData({...editData, title: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h2 className="text-xl font-semibold">{request.title}</h2>
          )}
          <StatusBadge status={request.status} />
        </div>

        <div className="border rounded-lg">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
          </div>
          <div className="p-4">
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={e => setEditData({...editData, description: e.target.value})}
                className="w-full min-h-[200px] p-3 border rounded focus:ring-2 focus:ring-blue-500"
                rows={8}
              />
            ) : (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap bg-transparent p-0 text-gray-700 font-sans">
                  {request.description}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount Requested</h3>
            <p className="mt-1 text-gray-900">{request.amountRequested.toString()} ICP</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount Raised</h3>
            <p className="mt-1 text-gray-900">{request.amountRaised.toString()} ICP</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Supporting Evidence</h3>
          {isEditing ? (
            <input
              type="text"
              value={editData.proofUrl}
              onChange={e => setEditData({...editData, proofUrl: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <a 
              href={request.proofUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-1 text-blue-600 hover:text-blue-800 break-all"
            >
              {request.proofUrl}
            </a>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p className="mt-1 text-gray-900">{formatDate(request.createdAt)}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Voting</h3>
          <div className="mt-1 flex space-x-4">
            <p className="text-green-600">For: {request.votesFor.toString()}</p>
            <p className="text-red-600">Against: {request.votesAgainst.toString()}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Edit Case
          </button>
        )}
      </div>
    </Modal>
  );
}
