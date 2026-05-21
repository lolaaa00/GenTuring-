import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { ExecutionResult, TransactionStatus } from 'genlayer-js/types';

export const CONTRACT_ADDRESS = '0xD28ce9831991ab3c643fD7BB84fDea436C40E935' as const;
export const STUDIONET_EXPLORER = 'https://explorer-studio.genlayer.com';

export const STUDIONET_CHAIN = {
  chainId: '0xF22F',
  chainName: 'GenLayer Studionet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://studio.genlayer.com/api'],
  blockExplorerUrls: [STUDIONET_EXPLORER],
} as const;

type WalletProvider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
};

type MatchVerdict = 'human' | 'ai';
type MatchConfidence = 'low' | 'medium' | 'high';

export interface MatchResult {
  match_id: string;
  player_key: string;
  player_guess: MatchVerdict;
  verdict: MatchVerdict;
  confidence: MatchConfidence;
  reason: string;
  correct: boolean;
}

export interface PlayerStats {
  games_played: number;
  correct_guesses: number;
  accuracy: number;
}

export interface GlobalStats {
  total_games: number;
  correct_guesses: number;
}

function getInjectedProvider(): WalletProvider {
  const provider = typeof window !== 'undefined' ? (window as Window & { ethereum?: WalletProvider }).ethereum : undefined;

  if (!provider) {
    throw new Error('No injected wallet detected. Install MetaMask or Rabby to continue.');
  }

  return provider;
}

function getReadClient() {
  return createClient({ chain: studionet });
}

function getWriteClient(address: `0x${string}`, provider: WalletProvider) {
  return createClient({
    chain: studionet,
    account: address,
    provider,
  });
}

function parseJsonOrThrow<T>(value: string, fallbackMessage: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(fallbackMessage);
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage) {
      return maybeMessage;
    }
  }

  return 'Unknown wallet error';
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function ensureStudionetNetwork(provider: WalletProvider) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET_CHAIN.chainId }],
    });
  } catch (error) {
    const code = typeof error === 'object' && error !== null ? (error as { code?: unknown }).code : undefined;

    if (code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [STUDIONET_CHAIN],
      });

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: STUDIONET_CHAIN.chainId }],
      });

      return;
    }

    throw new Error(`Could not switch wallet to GenLayer Studionet: ${getErrorMessage(error)}`);
  }
}

export function buildMatchId() {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `match_${Date.now()}_${suffix}`;
}

export async function connectInjectedWallet() {
  const provider = getInjectedProvider();
  const existingAccounts = await provider.request({ method: 'eth_accounts' });
  const accounts = ((existingAccounts as string[] | undefined)?.length ?? 0) > 0
    ? existingAccounts
    : await provider.request({ method: 'eth_requestAccounts' });
  const address = (accounts as string[] | undefined)?.[0] as `0x${string}` | undefined;

  if (!address) {
    throw new Error('Wallet connection was cancelled or no account was returned.');
  }

  await ensureStudionetNetwork(provider);

  return { address, provider };
}

export async function submitMatchForJudgement(input: {
  matchId: string;
  playerKey: string;
  transcript: string;
  playerGuess: MatchVerdict;
}) {
  const { address, provider } = await connectInjectedWallet();
  const readClient = getReadClient();
  const writeClient = getWriteClient(address, provider);
  const normalizedPlayerKey = address.toLowerCase();

  const txHash = await writeClient.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'judge_match',
    args: [input.matchId, normalizedPlayerKey, input.transcript, input.playerGuess],
    value: BigInt(0),
  });

  const receipt = await readClient.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    interval: 5000,
    retries: 36,
  });

  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    throw new Error(`Contract execution failed on GenLayer. Check the explorer trace for ${txHash}.`);
  }

  let rawMatch: unknown = 'null';

  for (let attempt = 0; attempt < 18; attempt += 1) {
    rawMatch = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_match',
      args: [input.matchId],
      stateStatus: 'accepted',
    });

    if (rawMatch !== 'null') {
      break;
    }

    await sleep(3000);
  }

  if (rawMatch === 'null') {
    const executionHint = typeof receipt.txExecutionResultName === 'string'
      ? ` Execution result: ${receipt.txExecutionResultName}.`
      : '';
    throw new Error(`Transaction was accepted, but the contract did not store a match for ${input.matchId}.${executionHint} Tx: ${txHash}`);
  }

  const match = parseJsonOrThrow<MatchResult>(
    String(rawMatch),
    'GenLayer returned an unreadable match payload.',
  );

  return { txHash, match, playerKey: normalizedPlayerKey };
}

export async function fetchGlobalStats() {
  const readClient = getReadClient();
  const result = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_global_stats',
    args: [],
    stateStatus: 'accepted',
  });

  const stats = result as Record<string, unknown>;

  return {
    total_games: Number(stats.total_games ?? 0),
    correct_guesses: Number(stats.correct_guesses ?? 0),
  } satisfies GlobalStats;
}

export async function fetchPlayerStats(playerKey: string) {
  const readClient = getReadClient();
  const rawStats = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_player_stats',
    args: [playerKey],
    stateStatus: 'accepted',
  });

  if (rawStats === 'null') {
    return {
      games_played: 0,
      correct_guesses: 0,
      accuracy: 0,
    } satisfies PlayerStats;
  }

  return parseJsonOrThrow<PlayerStats>(
    String(rawStats),
    'GenLayer returned unreadable player stats.',
  );
}

export async function fetchWalletScopedStats(playerKey: string) {
  const [playerStats, globalStats] = await Promise.all([
    fetchPlayerStats(playerKey),
    fetchGlobalStats(),
  ]);

  return { playerStats, globalStats };
}
