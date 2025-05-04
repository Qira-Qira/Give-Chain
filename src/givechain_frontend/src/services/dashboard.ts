import { Principal } from '@dfinity/principal';
import { createActor } from '@/utils/canister';
import type { Request, Result_1 } from '../../../declarations/givechain_backend/givechain_backend.did';

export interface CreateRequestInput {
  title: string;
  description: string;
  category: string;
  proofUrl: string;
  amountRequested: bigint;
  recipientAddress: string;
}

export interface UpdateRequestInput {
  id: bigint;
  title: string;
  description: string;
  category: string;
  proofUrl: string;
}

export interface EditRequestInput {
  id: bigint;
  title: string;
  description: string;
  category: string;
  proofUrl: string;
  currentVersion?: bigint;
}

export const dashboardService = {
  /**
   * Fetches all the requests that belong to a given user.
   * @param principalId The principal ID of the user.
   * @returns An array of requests that belong to the user.
   */
  async getUserRequests(principalId: string) {
    try {
      const actor = await createActor();
      console.log('Actor created, fetching requests...');

      const requests = await actor.getAllRequests();
      console.log('Received requests:', requests);

      const userPrincipal = Principal.fromText(principalId);
      return requests.filter(req => 
        req.owner.toString() === userPrincipal.toString()
      );
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  },

  async createRequest(input: CreateRequestInput): Promise<Result_1> {
    try {
      const actor = await createActor();

      if (!input.recipientAddress) {
        throw new Error('Recipient address is required');
      }

      let recipientPrincipal;
      try {
        recipientPrincipal = Principal.fromText(input.recipientAddress);
      } catch (err) {
        console.error('Principal conversion error:', err);
        throw new Error('Invalid recipient address format');
      }

      console.log('Creating request with:', {
        ...input,
        recipientPrincipal: recipientPrincipal.toText()
      });

      const result = await actor.submitRequest(
        input.title,
        input.description,
        input.category,
        input.proofUrl,
        input.amountRequested,
        recipientPrincipal
      );

      return result;
    } catch (error) {
      console.error('Create request error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to submit request');
    }
  },

  async updateRequest(input: UpdateRequestInput) {
    try {
      const actor = await createActor();
      
      console.log('Updating request:', input);

      const result = await actor.updateRequest(
        input.id,
        input.title,
        input.description,
        input.category,
        input.proofUrl
      );

      return result;
    } catch (error) {
      console.error('Update request error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to update request');
    }
  },

  async editRequest(input: EditRequestInput) {
    try {
      const actor = await createActor();
      console.log('Editing request:', input);

      // Use the correct method name from the backend
      const result = await actor.editRequest(
        input.id,
        {
          title: input.title,
          description: input.description,
          category: input.category,
          proofUrl: input.proofUrl,
          version: input.currentVersion || BigInt(0)
        }
      );

      return result;
    } catch (error) {
      console.error('Edit request error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to edit request');
    }
  },

  async updateCaseRequest(
    id: bigint,
    title: string,
    description: string,
    category: string,
    proofUrl: string
  ) {
    try {
      const actor = await createActor();
      
      // Debug logs
      console.log('Actor methods:', Object.keys(actor));
      console.log('Updating request with:', { id, title, description, category, proofUrl });

      // Use the correct camelCase method name to match Motoko backend
      const result = await actor.updateRequest(
        id,
        title,
        description,
        category,
        proofUrl
      );

      console.log('Update result:', result);
      return result;

    } catch (error) {
      console.error('Update case request error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to update case request');
    }
  },

  async getDonationSummary() {
    const actor = await createActor();
    return actor.getDonationSummary();
  },

  async getRequestStatistics() {
    const actor = await createActor();
    return actor.getRequestStatistics();
  },

  async getWeeklyDonations(startTime: bigint, endTime: bigint) {
    const actor = await createActor();
    return actor.getWeeklyDonations(startTime, endTime);
  },

  async getUserNotifications() {
    const actor = await createActor();
    return actor.getUserNotifications();
  },

  async getStructuredAuditLog(params: {
    eventType: string | null;
    startTime: bigint | null;
    endTime: bigint | null;
    userPrincipal: string | null;
  }) {
    const actor = await createActor();
    return actor.getStructuredAuditLog(
      params.eventType,
      params.startTime,
      params.endTime,
      params.userPrincipal ? Principal.fromText(params.userPrincipal) : null
    );
  }
};
