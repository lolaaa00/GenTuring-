import { useState, useCallback } from 'react';
import {
  AppMode, GameState, GamePhase, ChatMessage, INITIAL_GAME_STATE,
  getRandomPersonality, getOpponentResponse, generateValidators,
  generateContentValidators, getConsensus, calculateScore
} from '@/lib/gameEngine';
import { judgeWithGenLayer, CONTRACT_ADDRESS } from '@/genlayer';

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
      ...prev, mode, phase: 'home', messages: [], analysisInput: '',
      validators: [], consensus: null, txHash: null, userGuess: null, appealCount: 0,
    }));
  }, []);

  const startSelectedMode = useCallback(() => {
    if (!state.walletAddress) { alert('Please connect your wallet first!'); return; }
    if (state.mode === 'analyze') {
      setState(prev => ({
        ...prev, phase: 'analyze', messages: [], analysisInput: '',
        validators: [], consensus: null, txHash: null, userGuess: null, appealCount: 0,
      }));
      return;
    }
    const newPersonality = getRandomPersonality();
    setPersonality(newPersonality);
    const opponentType = Math.random() > 0.5 ? 'ai' : 'human';
    setState(prev => ({
      ...prev, phase: 'matchmaking', opponentType, opponentPersonality: newPersonality.name,
      messages: [], userGuess: null, validators: [], consensus: null, txHash: null, appealCount: 0,
    }));
    setTimeout(() => { setState(prev => ({ ...prev, phase: 'chat' })); }, 1800);
  }, [state.mode, state.walletAddress]);

  const sendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text, timestamp: Date.now() };
    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setState(prev => {
        const response = getOpponentResponse(personality, prev.messages.length);
        const opponentMsg: ChatMessage = { id: `opp-${Date.now()}`, sender: 'opponent', text: response, timestamp: Date.now() };
        return { ...prev, messages: [...prev.messages, opponentMsg] };
      });
    }, delay);
  }, [personality]);

  const submitGuess = useCallback((guess: 'AI' | 'Human') => {
    setState(prev => {
      const allMessages = prev.messages.filter(m => m.sender === 'opponent').map(m => m.text).join(' ');
      judgeWithGenLayer(allMessages, guess.toLowerCase())
        .then(({ verdict, txHash }) => {
          setState(inner => {
            const validators = generateValidators(inner.opponentType, 5);
            const consensus = verdict as 'human' | 'ai';
            const scoreChange = calculateScore(guess, consensus, inner.opponentType);
            return { ...inner, validators, consensus, txHash, score: inner.score + scoreChange, totalGames: inner.totalGames + 1, phase: 'result' };
          });
        })
        .catch(() => {
          setState(inner => {
            const validators = generateValidators(inner.opponentType, 5);
            const consensus = getConsensus(validators);
            const scoreChange = calculateScore(guess, consensus, inner.opponentType);
            return { ...inner, validators, consensus, score: inner.score + scoreChange, totalGames: inner.totalGames + 1, phase: 'result' };
          });
        });
      return { ...prev, userGuess: guess, phase: 'validating', txHash: null };
    });
  }, [personality]);

  const analyzeContent = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState(prev => ({ ...prev, analysisInput: trimmed, validators: [], consensus: null, txHash: null, phase: 'validating', appealCount: 0 }));
    judgeWithGenLayer(trimmed, 'ai')
      .then(({ verdict, txHash }) => {
        setState(prev => {
          const validators = generateContentValidators(trimmed, 5);
          return { ...prev, validators, consensus: verdict as 'human' | 'ai', txHash, phase: 'result' };
        });
      })
      .catch(() => {
        setTimeout(() => {
          setState(prev => {
            const validators = generateContentValidators(trimmed, 5);
            return { ...prev, validators, consensus: getConsensus(validators), phase: 'result' };
          });
        }, 2600);
      });
  }, []);

  const appeal = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'validating', appealCount: prev.appealCount + 1, txHash: null }));
    setTimeout(() => {
      setState(prev => {
        const newCount = 5 + (prev.appealCount * 2);
        const validators = prev.mode === 'analyze' ? generateContentValidators(prev.analysisInput, newCount) : generateValidators(prev.opponentType, newCount);
        return { ...prev, validators, consensus: getConsensus(validators), phase: 'result' };
      });
    }, 5000);
  }, []);

  const verifyOnGenLayer = useCallback(async () => {
    setState(prev => ({ ...prev, phase: 'genlayer' }));
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
    if (!ethereum) { alert('No wallet detected. Please install Rabby or MetaMask.'); setState(prev => ({ ...prev, phase: 'result' })); return; }
    try {
      const existingAccounts: string[] = await ethereum.request({ method: 'eth_accounts' });
      const accounts: string[] = existingAccounts.length ? existingAccounts : await ethereum.request({ method: 'eth_requestAccounts' });
      const from = accounts[0];
      if (!from) throw new Error('No account returned');
      setState(prev => ({ ...prev, walletAddress: from }));
      try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BRADBURY_CHAIN.chainId }] });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({ method: 'wallet_addEthereumChain', params: [BRADBURY_CHAIN] });
          await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BRADBURY_CHAIN.chainId }] });
        } else { throw switchError; }
      }
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: CONTRACT_ADDRESS, value: '0x0', data: '0x' }],
      });
      setState(prev => ({ ...prev, txHash, walletAddress: from, phase: 'result' }));
    } catch (e: any) {
      alert('Transaction failed: ' + (e?.message || 'Unknown error'));
      setState(prev => ({ ...prev, phase: 'result' }));
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
      if (!ethereum) { alert('No wallet detected. Please install Rabby or MetaMask.'); return false; }
      const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts[0]) return false;
      setState(prev => ({ ...prev, walletAddress: accounts[0] }));
      return true;
    } catch { return false; }
  }, []);

  const resetGame = useCallback(() => {
    setState(prev => ({ ...INITIAL_GAME_STATE, mode: prev.mode, score: prev.score, totalGames: prev.totalGames, walletAddress: prev.walletAddress }));
  }, []);

  return { state, startSelectedMode, sendMessage, submitGuess, analyzeContent, appeal, verifyOnGenLayer, connectWallet, resetGame, setPhase, setMode };
}
