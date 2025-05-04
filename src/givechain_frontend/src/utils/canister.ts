import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/givechain_backend';

const BACKEND_CANISTER_ID = 'uxrrr-q7777-77774-qaaaq-cai';
const HOST = 'http://127.0.0.1:4943';

export async function createActor() {
  const agent = new HttpAgent({
    host: HOST,
  });

  // Only fetch root key in development
  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey();
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId: BACKEND_CANISTER_ID,
  });
}
