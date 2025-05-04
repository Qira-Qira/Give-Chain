import { useState } from 'react';
import { dashboardService } from '@/services/dashboard';

interface FormData {
  title: string;
  description: string;
  category: string;
  proofUrl: string;
  amountRequested: string;
}

export default function SubmitCaseForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    proofUrl: '',
    amountRequested: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): string | null => {
    if (!formData.title || !formData.description || !formData.category || !formData.proofUrl || !formData.amountRequested) {
      return 'All fields are required';
    }
    if (isNaN(Number(formData.amountRequested))) {
      return 'Amount requested must be a number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setError(error);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get logged in user's principal from localStorage
      const userPrincipal = localStorage.getItem('userPrincipal');
      if (!userPrincipal) {
        throw new Error('User not logged in');
      }

      await dashboardService.createRequest({
        ...formData,
        amountRequested: BigInt(formData.amountRequested),
        recipientAddress: userPrincipal // Use logged in user's principal
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <label>Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>
      <div>
        <label>Proof URL</label>
        <input
          type="text"
          value={formData.proofUrl}
          onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
        />
      </div>
      <div>
        <label>Amount Requested</label>
        <input
          type="text"
          value={formData.amountRequested}
          onChange={(e) => setFormData({ ...formData, amountRequested: e.target.value })}
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}