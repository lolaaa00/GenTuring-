import { createClient, createAccount } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

const client = createClient({ network: testnetBradbury });

// Paste your contract address here after deploying on Studio
export const CONTRACT_ADDRESS = '0x5A72e203BF7574b0CaAe36E4351b32B95Cd3Bc7A';

export async function judgeWithGenLayer(
  message: string,
  playerGuess: string
): Promise<{ verdict: string; correct: boolean; txHash: string }> {
  const account = createAccount();

  const txHash = await client.writeContract({
    account,
    address: CONTRACT_ADDRESS,
    functionName: 'judge_response',
    args: [message, playerGuess],
    value: 0,
  });

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
  });

  const result = JSON.parse(receipt.result ?? '{}');

  return {
    verdict: result.verdict ?? 'ai',
    correct: result.correct ?? false,
    txHash,
  };
}

export async function getGameStats() {
  return await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_stats',
    args: [],
  });
}
