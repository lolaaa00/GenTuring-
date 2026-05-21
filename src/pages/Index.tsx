import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import HomeScreen from '@/components/game/HomeScreen';
import MatchmakingScreen from '@/components/game/MatchmakingScreen';
import ChatScreen from '@/components/game/ChatScreen';
import GuessScreen from '@/components/game/GuessScreen';
import ValidatingScreen from '@/components/game/ValidatingScreen';
import ResultScreen from '@/components/game/ResultScreen';
import AnalyzeContentScreen from '@/components/game/AnalyzeContentScreen';
import AnalysisResultScreen from '@/components/game/AnalysisResultScreen';
import FaucetInfo from '@/components/game/FaucetInfo';
import { Coins, Star } from 'lucide-react';
import genturingLogo from '@/assets/genturing-logo.png';

export default function Index() {
  const {
    state, startSelectedMode, setMode, sendMessage, submitGuess,
    analyzeContent, appeal, connectWallet, resetGame, setPhase,
  } = useGameState();
  const [showFaucet, setShowFaucet] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Fixed top nav - always visible */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm border-b border-border">
        <button
          onClick={resetGame}
          className="font-display text-sm tracking-widest hover:opacity-80 flex items-center gap-2"
        >
          <img src={genturingLogo} alt="" className="w-8 h-8 rounded-full" />
          <span className="text-accent">Gen</span><span className="text-primary">Turing</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/50">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-display text-xs text-foreground">{state.score} pts</span>
          </div>
          {state.walletAddress ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-display text-xs text-primary">
                {state.walletAddress.slice(0, 6)}...{state.walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={() => connectWallet()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-muted-foreground/30 bg-card/50 hover:border-primary/50 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span className="font-display text-xs text-muted-foreground">Connect Wallet</span>
            </button>
          )}
          <button
            onClick={() => setShowFaucet(true)}
            className="text-muted-foreground hover:text-primary transition-colors p-1"
          >
            <Coins className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content with top padding for fixed nav */}
      <div className="pt-12">
        <AnimatePresence mode="wait">
          {state.phase === 'home' && (
            <HomeScreen
              key="home"
              onStartMatch={startSelectedMode}
              onModeChange={setMode}
              onConnectWallet={connectWallet}
              walletAddress={state.walletAddress}
              score={state.score}
              totalGames={state.totalGames}
              accuracy={state.accuracy}
              mode={state.mode}
            />
          )}
          {state.phase === 'matchmaking' && (
            <motion.div key="matchmaking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MatchmakingScreen />
            </motion.div>
          )}
          {state.phase === 'analyze' && (
            <AnalyzeContentScreen
              key="analyze"
              onAnalyze={analyzeContent}
              walletAddress={state.walletAddress}
            />
          )}
          {state.phase === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChatScreen
                messages={state.messages}
                onSendMessage={sendMessage}
                onEndChat={() => setPhase('guess')}
              />
            </motion.div>
          )}
          {state.phase === 'guess' && (
            <motion.div key="guess" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GuessScreen onGuess={submitGuess} />
            </motion.div>
          )}
          {state.phase === 'validating' && (
            <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ValidatingScreen mode={state.mode} />
            </motion.div>
          )}
          {(state.phase === 'result' || state.phase === 'genlayer') && state.consensus && state.mode === 'game' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultScreen
                userGuess={state.userGuess!}
                consensus={state.consensus}
                actualType={state.consensus === 'AI' ? 'ai' : 'human'}
                validators={state.validators}
                score={state.score}
                onAppeal={appeal}
                onPlayAgain={resetGame}
                txHash={state.txHash}
                appealCount={state.appealCount}
                matchId={state.matchId}
                confidence={state.confidence}
                reason={state.reason}
                totalGames={state.totalGames}
                correctGuesses={state.correctGuesses}
                accuracy={state.accuracy}
              />
            </motion.div>
          )}
          {(state.phase === 'result' || state.phase === 'genlayer') && state.consensus && state.mode === 'analyze' && (
            <motion.div key="analysis-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalysisResultScreen
                content={state.analysisInput}
                consensus={state.consensus}
                validators={state.validators}
                onAnalyzeAnother={resetGame}
                onAppeal={appeal}
                appealCount={state.appealCount}
                reason={state.reason}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFaucet && <FaucetInfo onClose={() => setShowFaucet(false)} />}
      </AnimatePresence>
    </div>
  );
}
