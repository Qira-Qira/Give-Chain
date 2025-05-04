import { Principal } from '@dfinity/principal';
import { createActor } from '@/utils/canister';

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authService = {
  validatePrincipalFormat(text: string): boolean {
    try {
      if (!text) return false;
      // Check basic format using regex
      if (!text.match(/^[a-z0-9-]+$/)) return false;
      // Try creating Principal - this validates the actual format
      Principal.fromText(text);
      return true;
    } catch {
      return false;
    }
  },

  async login(principalText: string) {
    try {
      if (!this.validatePrincipalFormat(principalText)) {
        throw new AuthError(
          'Format ID Principal tidak valid. Contoh format yang benar: uxrrr-q7777-77774-qaaaq-cai', 
          'INVALID_FORMAT'
        );
      }

      const actor = await createActor();
      console.log('Mencoba login dengan principal:', principalText);

      // Verify connection by calling a backend method
      const requests = await actor.getAllRequests();
      console.log('Koneksi ke backend berhasil');

      localStorage.setItem('userPrincipal', principalText);
      return { success: true, principal: principalText };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      
      console.error('Login error:', error);
      throw new AuthError(
        'Principal/Canister ID tidak ditemukan atau tidak valid', 
        'INVALID_PRINCIPAL'
      );
    }
  }
};
