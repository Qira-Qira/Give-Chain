import { useState } from 'react';
import { useRouter } from 'next/router';
import { authService, AuthError } from '@/services/auth';

export default function LoginPage() {
  const router = useRouter();
  const [principal, setPrincipal] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (value: string) => {
    setPrincipal(value);
    if (value && !authService.validatePrincipalFormat(value)) {
      setError('Format ID Principal tidak valid');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.login(principal);
      if (result.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Login ke GiveChain</h1>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>Contoh format Principal ID yang valid: uxrrr-q7777-77774-qaaaq-cai</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 w-full max-w-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Principal ID</label>
          <input
            type="text"
            value={principal}
            onChange={(e) => handleInputChange(e.target.value)}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
              ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Masukkan Principal ID Anda"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Gunakan Principal ID atau Canister ID yang valid
          </p>
        </div>

        <button 
          type="submit"
          disabled={isLoading || !!error}
          className={`w-full p-3 text-white bg-blue-500 rounded 
            ${(isLoading || !!error) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          {isLoading ? 'Memeriksa...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
