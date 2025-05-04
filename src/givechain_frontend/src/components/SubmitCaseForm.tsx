import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard';

interface FormData {
  title: string;
  description: string;
  category: string;
  proofUrl: string;
  amountRequested: string;
  recipientAddress: string;
}

interface SubmitCaseFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function SubmitCaseForm({ onSuccess, onClose }: SubmitCaseFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    proofUrl: '',
    amountRequested: '',
    recipientAddress: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userPrincipal = localStorage.getItem('userPrincipal');
    if (userPrincipal) {
      setFormData(prev => ({ ...prev, recipientAddress: userPrincipal }));
    }
  }, []);

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.category) return 'Category is required';
    if (!formData.proofUrl.trim()) return 'Proof URL is required';
    if (!formData.amountRequested || Number(formData.amountRequested) <= 0) {
      return 'Amount must be greater than 0';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await dashboardService.createRequest({
        ...formData,
        amountRequested: BigInt(formData.amountRequested)
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a category</option>
          <option value="EDUCATION">Education</option>
          <option value="HEALTH">Healthcare</option>
          <option value="DISASTER">Disaster Relief</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount Requested (ICP)</label>
        <input
          type="number"
          value={formData.amountRequested}
          onChange={e => setFormData({ ...formData, amountRequested: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Proof URL</label>
        <input
          type="url"
          value={formData.proofUrl}
          onChange={e => setFormData({ ...formData, proofUrl: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="https://"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Case'}
        </button>
      </div>
    </form>
  );
}
