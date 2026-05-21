import { useState, useCallback } from 'react';
import {
  AppMode,
  GameState,
  GamePhase,
  ChatMessage,
  INITIAL_GAME_STATE,
  getRandomPersonality,
  getOpponentResponse,
  generateValidators,
  generateContentValidators,
  getConsensus,
  calculateScore,
} from '@/lib/gameEngine';
import {
  buildMatchId,
  connectInjectedWallet,
  fetchWalletScopedStats,
  submitMatchForJudgement,
} from '@/genlayer';

function toConsensusLabel(verdict: 'human' | 'ai'): 'AI' | 'Human' {
  return verdict === 'ai' ? 'AI' : 'Human';
}

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [personality, setPersonality] = useState(getRandomPersonality());

  const syncContractStats = useCallback(async (playerKey: string) => {
    const normalizedKey = playerKey.toLowerCase();
    const { playerStats, globalStats } = await fetchWalletScopedStats(normalizedKey);

    setState((prev) => ({
      ...prev,
      walletAddress: normalizedKey,
      totalGames: playerStats.games_played,
      correctGuesses: playerStats.correct_guesses,
      accuracy: playerStats.accuracy,
      globalCorrectGuesses: globalStats.correct_guesses,
    }));
  }, []);

  const setPhase = useCallback((phase: GamePhase) => {
    setState((prev) => ({ ...prev, phase }));
  }, []);

  const setMode = useCallback((mode: AppMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      phase: 'home',
      messages: [],
      analysisInput: '',
      validators: [],
      consensus: null,
      matchId: null,
      confidence: null,
      reason: null,
      txHash: null,
      userGuess: null,
      appealCount: 0,
    }));
  }, []);

  const startSelectedMode = useCallback(() => {
    if (!state.walletAddress) {
      alert('Please connect your injected wallet first.');
      return;
    }

    if (state.mode === 'analyze') {
      setState((prev) => ({
        ...prev,
        phase: 'analyze',
        messages: [],
        analysisInput: '',
        validators: [],
        consensus: null,
        matchId: null,
        confidence: null,
        reason: null,
        txHash: null,
        userGuess: null,
        appealCount: 0,
      }));
      return;
    }

    const newPersonality = getRandomPersonality();
    setPersonality(newPersonality);

    setState((prev) => ({
      ...prev,
      phase: 'matchmaking',
      opponentType: Math.random() > 0.5 ? 'ai' : 'human',
      opponentPersonality: newPersonality.name,
      messages: [],
      userGuess: null,
      validators: [],
      consensus: null,
      matchId: null,
      confidence: null,
      reason: null,
      txHash: null,
      appealCount: 0,
    }));

    setTimeout(() => {
      setState((prev) => ({ ...prev, phase: 'chat' }));
    }, 1800);
  }, [state.mode, state.walletAddress]);

  const sendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setState((prev) => ({ ...prev, messages: [...prev.messages, userMsg] }));

    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setState((prev) => {
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
    const matchId = buildMatchId();

    setState((prev) => ({ ...prev, userGuess: guess, phase: 'validating', txHash: null, matchId }));

    const rememberedPlayerKey = state.walletAddress?.toLowerCase();
    if (!rememberedPlayerKey) {
      alert('Connect your wallet before submitting a guess.');
      setState((prev) => ({ ...prev, phase: 'home' }));
      return;
    }

    const transcript = JSON.stringify(state.messages);

    submitMatchForJudgement({
      matchId,
      playerKey: rememberedPlayerKey,
      transcript,
      playerGuess: guess.toLowerCase() as 'human' | 'ai',
    })
      .then(async ({ txHash, match, playerKey }) => {
        const verdictLabel = toConsensusLabel(match.verdict);
        const actualType = match.verdict;
        const validators = generateValidators(actualType, 5, true);
        const scoreChange = calculateScore(guess, verdictLabel, actualType);

        setState((prev) => ({
          ...prev,
          validators,
          consensus: verdictLabel,
          confidence: match.confidence,
          reason: match.reason,
          txHash,
          score: prev.score + scoreChange,
          phase: 'result',
        }));

        await syncContractStats(playerKey);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown GenLayer error';
        console.error('Match submission failed:', error);
        alert(`Match submission failed: ${message}`);
        setState((prev) => ({ ...prev, phase: 'guess' }));
      });
  }, [state.messages, state.walletAddress, syncContractStats]);

  const analyzeContent = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setState((prev) => ({
      ...prev,
      analysisInput: trimmed,
      validators: [],
      consensus: null,
      matchId: null,
      confidence: null,
      reason: 'Analyze mode stays local. Match adjudication happens in the chat flow on Studionet.',
      txHash: null,
      phase: 'validating',
      appealCount: 0,
    }));

    setTimeout(() => {
      setState((prev) => {
        const validators = generateContentValidators(trimmed, 5);
        const consensus = getConsensus(validators);

        return {
          ...prev,
          validators,
          consensus,
          confidence: null,
          phase: 'result',
        };
      });
    }, 2600);
  }, []);

  const appeal = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'validating', appealCount: prev.appealCount + 1, txHash: prev.txHash }));

    setTimeout(() => {
      setState((prev) => {
        const newCount = 5 + (prev.appealCount * 2);
        const validators = prev.mode === 'analyze'
          ? generateContentValidators(prev.analysisInput, newCount)
          : generateValidators(prev.consensus === 'AI' ? 'ai' : 'human', newCount, true);

        return { ...prev, validators, consensus: getConsensus(validators), phase: 'result' };
      });
    }, 3000);
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const { address } = await connectInjectedWallet();
      await syncContractStats(address);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown wallet error';
      console.error('Wallet connection failed:', error);
      alert(message);
      return false;
    }
  }, [syncContractStats]);

  const resetGame = useCallback(() => {
    setState((prev) => ({
      ...INITIAL_GAME_STATE,
      mode: prev.mode,
      score: prev.score,
      totalGames: prev.totalGames,
      correctGuesses: prev.correctGuesses,
      accuracy: prev.accuracy,
      globalCorrectGuesses: prev.globalCorrectGuesses,
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
    connectWallet,
    resetGame,
    setPhase,
    setMode,
  };
}
