import { useState } from 'react';
import { useRouter } from 'next/router';
import { Principal } from '@dfinity/principal';
import { dashboardService, CreateRequestInput } from '@/services/dashboard';

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [principalError, setPrincipalError] = useState('');
  const [formData, setFormData] = useState<Omit<CreateRequestInput, 'amountRequested'> & { amountRequested: string }>({
    title: '',
    description: '',
    category: '',
    proofUrl: '',
    amountRequested: '',
    recipientAddress: ''
  });

  const validatePrincipal = (principalId: string): boolean => {
    try {
      if (!principalId) {
        setPrincipalError('Principal ID is required');
        return false;
      }
      Principal.fromText(principalId);
      setPrincipalError('');
      return true;
    } catch (e) {
      setPrincipalError('Invalid Principal ID format. Please use a valid canister ID');
      return false;
    }
  };

  const handlePrincipalChange = (value: string) => {
    setFormData({ ...formData, recipientAddress: value });
    validatePrincipal(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!validatePrincipal(formData.recipientAddress)) {
        setLoading(false);
        return;
      }

      const input: CreateRequestInput = {
        ...formData,
        amountRequested: BigInt(formData.amountRequested)
      };

      const result = await dashboardService.createRequest(input);
      
      if ('ok' in result) {
        router.push('/dashboard');
      } else {
        setError(result.err);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-8">Submit New Request</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Proof URL</label>
          <input
            type="url"
            value={formData.proofUrl}
            onChange={e => setFormData({...formData, proofUrl: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Amount Requested</label>
          <input
            type="number"
            value={formData.amountRequested}
            onChange={e => setFormData({...formData, amountRequested: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Recipient Address (Principal ID)</label>
          <input
            type="text"
            value={formData.recipientAddress}
            onChange={(e) => handlePrincipalChange(e.target.value)}
            className={`w-full p-2 border rounded ${principalError ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., uxrrr-q7777-77774-qaaaq-cai"
            required
          />
          {principalError && (
            <p className="mt-1 text-sm text-red-500">{principalError}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Enter a valid canister/principal ID. Example format: uxrrr-q7777-77774-qaaaq-cai
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !!principalError}
          className={`w-full p-3 text-white bg-blue-500 rounded 
            ${(loading || !!principalError) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
