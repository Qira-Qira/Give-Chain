import { Principal } from '@dfinity/principal';
import { createActor } from '@/utils/canister';

export interface CreateRequestInput {
  title: string;
  description: string;
  category: string;
  proofUrl: string;
  amountRequested: bigint;
  recipientAddress: string;
}

export const dashboardService = {
  async createRequest(input: CreateRequestInput) {
    try {
      const actor = await createActor();
      console.log('Connecting to backend canister...');

      // Validate and convert principal
      if (!input.recipientAddress) {
        throw new Error('Recipient address is required');
      }

      const recipientPrincipal = Principal.fromText(input.recipientAddress);
      console.log('Submitting request with principal:', recipientPrincipal.toText());

      const result = await actor.submitRequest(
        input.title,
        input.description,
        input.category,
        input.proofUrl,
        input.amountRequested,
        recipientPrincipal
      );

      console.log('Submit result:', result);
      return result;
    } catch (error) {
      console.error('Submit request failed:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to submit request');
    }
  }
};