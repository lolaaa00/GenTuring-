import { useState, useCallback } from 'react';
import {
  AppMode, GameState, GamePhase, ChatMessage, INITIAL_GAME_STATE,
  getRandomPersonality, getOpponentResponse, generateValidators,
  generateContentValidators, getConsensus, calculateScore
} from '@/lib/gameEngine';

const BRADBURY_CHAIN = {
  chainId: '0x107D',
  chainName: 'GenLayer Bradbury',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://zksync-os-testnet-genlayer.zksync.dev'],
  blockExplorerUrls: ['https://explorer-bradbury.genlayer.com'],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [personality, setPersonality] = useState(getRandomPersonality());

  const setPhase = useCallback((phase: GamePhase) => {
    setState(prev => ({ ...prev, phase }));
  }, []);

  const setMode = useCallback((mode: AppMode) => {
    setState(prev => ({
      ...prev,
      mode,
      phase: 'home',
      messages: [],
      analysisInput: '',
      validators: [],
      consensus: null,
      txHash: null,
      userGuess: null,
      appealCount: 0,
    }));
  }, []);

  const startSelectedMode = useCallback(() => {
    if (!state.walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    if (state.mode === 'analyze') {
      setState(prev => ({
        ...prev,
        phase: 'analyze',
        messages: [],
        analysisInput: '',
        validators: [],
        consensus: null,
        txHash: null,
        userGuess: null,
        appealCount: 0,
      }));
      return;
    }

    const newPersonality = getRandomPersonality();
    setPersonality(newPersonality);
    const opponentType = Math.random() > 0.5 ? 'ai' : 'human'; // 50/50 split
    setState(prev => ({
      ...prev,
      phase: 'matchmaking',
      opponentType,
      opponentPersonality: newPersonality.name,
      messages: [],
      userGuess: null,
      validators: [],
      consensus: null,
      txHash: null,
      appealCount: 0,
    }));

    // Simulate matchmaking delay
    setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'chat' }));
    }, 1800);
  }, [state.mode, state.walletAddress]);

  const sendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setState(prev => {
      const newMessages = [...prev.messages, userMsg];
      return { ...prev, messages: newMessages };
    });

    // Opponent responds after delay
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setState(prev => {
        const response = getOpponentResponse(personality, prev.messages.length);
        const opponentMsg: ChatMessage = {
          id: `opp-${Date.now()}`,
          sender: 'opponent',
          text: response,
          timestamp: Date.now(),
        };
        return { ...prev, messages: [...prev.messages, opponentMsg] };
      });
    }, delay);
  }, [personality]);

  const submitGuess = useCallback((guess: 'AI' | 'Human') => {
    setState(prev => ({ ...prev, userGuess: guess, phase: 'validating', txHash: null }));

    // Simulate validator processing
    setTimeout(() => {
      setState(prev => {
        const validators = generateValidators(prev.opponentType, 5);
        const consensus = getConsensus(validators);
        const scoreChange = calculateScore(guess, consensus, prev.opponentType);
        return {
          ...prev,
          validators,
          consensus,
          score: prev.score + scoreChange,
          totalGames: prev.totalGames + 1,
          phase: 'result',
        };
      });
    }, 4000);
  }, []);

  const analyzeContent = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setState(prev => ({
      ...prev,
      analysisInput: trimmed,
      validators: [],
      consensus: null,
      txHash: null,
      phase: 'validating',
      appealCount: 0,
    }));

    setTimeout(() => {
      setState(prev => {
        const validators = generateContentValidators(trimmed, 5);
        const consensus = getConsensus(validators);
        return {
          ...prev,
          validators,
          consensus,
          phase: 'result',
        };
      });
    }, 2600);
  }, []);

  const appeal = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'validating',
      appealCount: prev.appealCount + 1,
      txHash: null,
    }));

    setTimeout(() => {
      setState(prev => {
        const newCount = 5 + (prev.appealCount * 2); // 7, 9, 11...
        const validators = prev.mode === 'analyze'
          ? generateContentValidators(prev.analysisInput, newCount)
          : generateValidators(prev.opponentType, newCount);
        const consensus = getConsensus(validators);
        return {
          ...prev,
          validators,
          consensus,
          phase: 'result',
        };
      });
    }, 5000);
  }, []);

  const verifyOnGenLayer = useCallback(async () => {
    setState(prev => ({ ...prev, phase: 'genlayer' }));
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (!ethereum) {
      alert('No wallet detected. Please install Rabby or MetaMask.');
      setState(prev => ({ ...prev, phase: 'result' }));
      return;
    }

    try {
      const existingAccounts: string[] = await ethereum.request({ method: 'eth_accounts' });
      const accounts: string[] = existingAccounts.length
        ? existingAccounts
        : await ethereum.request({ method: 'eth_requestAccounts' });
      const from = accounts[0];
      if (!from) throw new Error('No account returned');
      setState(prev => ({ ...prev, walletAddress: from }));

      // Switch to GenLayer Bradbury testnet
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BRADBURY_CHAIN.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BRADBURY_CHAIN],
          });
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BRADBURY_CHAIN.chainId }],
          });
        } else {
          throw switchError;
        }
      }

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: from, value: '0x0' }],
      });

      console.log('GenLayer Bradbury verification tx:', txHash);
      setState(prev => ({ ...prev, txHash, walletAddress: from, phase: 'result' }));
    } catch (e: any) {
      console.error('Wallet transaction failed:', e);
      alert('Transaction failed: ' + (e?.message || 'Unknown error'));
      setState(prev => ({ ...prev, phase: 'result' }));
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
      if (!ethereum) {
        alert('No wallet detected. Please install Rabby or MetaMask.');
        return false;
      }

      const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts[0]) return false;

      setState(prev => ({ ...prev, walletAddress: accounts[0] }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetGame = useCallback(() => {
    setState(prev => ({
      ...INITIAL_GAME_STATE,
      mode: prev.mode,
      score: prev.score,
      totalGames: prev.totalGames,
      walletAddress: prev.walletAddress,
    }));
  }, []);

  return {
    state,
    startSelectedMode,
    sendMessage,
    submitGuess,
    analyzeContent,
    appeal,
    verifyOnGenLayer,
    connectWallet,
    resetGame,
    setPhase,
    setMode,
  };
}
