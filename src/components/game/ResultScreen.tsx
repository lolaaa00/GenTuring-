import { motion } from 'framer-motion';
import { Bot, User, CheckCircle2, XCircle, AlertTriangle, Shield, RotateCcw, Gavel, Coins, Copy, BrainCircuit, Target } from 'lucide-react';
import { STUDIONET_EXPLORER } from '@/genlayer';
import type { ValidatorResult } from '@/lib/gameEngine';

interface ResultScreenProps {
  userGuess: 'AI' | 'Human';
  consensus: 'AI' | 'Human';
  actualType: 'ai' | 'human';
  validators: ValidatorResult[];
  score: number;
  onAppeal: () => void;
  onPlayAgain: () => void;
  txHash: string | null;
  appealCount: number;
  matchId: string | null;
  confidence: 'low' | 'medium' | 'high' | null;
  reason: string | null;
  totalGames: number;
  correctGuesses: number;
  accuracy: number;
}

export default function ResultScreen({
  userGuess, consensus, actualType, validators, score,
  onAppeal, onPlayAgain, txHash, appealCount,
  matchId, confidence, reason, totalGames, correctGuesses, accuracy,
}: ResultScreenProps) {
  const actual = actualType === 'ai' ? 'AI' : 'Human';
  const userCorrect = userGuess === actual;
  const aiVotes = validators.filter(v => v.classification === 'AI').length;
  const humanVotes = validators.filter(v => v.classification === 'Human').length;

  return (
    <div className="min-h-screen p-4 pb-20 relative">
      <div className="absolute inset-0 scanlines pointer-events-none opacity-15" />
      <div className="max-w-3xl mx-auto space-y-6 pt-8">

        {/* Consensus Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-xl border-2 border-primary/40 bg-card/80 border-glow-cyan"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            <span className="font-display text-xs text-secondary tracking-widest uppercase">GenLayer Match Finalized</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            {consensus === 'AI' ? <Bot className="w-10 h-10 text-primary" /> : <User className="w-10 h-10 text-accent" />}
            <h2 className="font-display text-4xl font-bold text-foreground">{consensus}</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {aiVotes} AI votes / {humanVotes} Human votes ({validators.length} validators)
          </p>

          {(confidence || matchId) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              {confidence && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                  Confidence: <span className="text-foreground uppercase">{confidence}</span>
                </span>
              )}
              {matchId && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
                  <Target className="w-3.5 h-3.5 text-accent" />
                  {matchId}
                </span>
              )}
            </div>
          )}

          {/* Vote bar */}
          <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(aiVotes / validators.length) * 100}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className="bg-primary rounded-l-full"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(humanVotes / validators.length) * 100}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className="bg-accent rounded-r-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>AI ({Math.round((aiVotes / validators.length) * 100)}%)</span>
            <span>Human ({Math.round((humanVotes / validators.length) * 100)}%)</span>
          </div>
        </motion.div>

        {/* Your Guess vs Reality */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-5 rounded-xl border ${userCorrect ? 'border-secondary/40 bg-secondary/5' : 'border-destructive/40 bg-destructive/5'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {userCorrect ? <CheckCircle2 className="w-5 h-5 text-secondary" /> : <XCircle className="w-5 h-5 text-destructive" />}
              <span className="font-display text-xs tracking-wider text-muted-foreground">YOUR GUESS</span>
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{userGuess}</div>
            <div className={`text-sm mt-1 ${userCorrect ? 'text-secondary' : 'text-destructive'}`}>
              {userCorrect ? 'Correct!' : 'Incorrect'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-xl border border-border bg-card/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-neon-orange" />
              <span className="font-display text-xs tracking-wider text-muted-foreground">ACTUAL</span>
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{actual}</div>
            <div className="flex items-center gap-1 mt-1">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm text-primary font-display">{score > 0 ? '+' : ''}{score} pts</span>
            </div>
          </motion.div>
        </div>

        {reason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-lg border border-secondary/20 bg-secondary/5"
          >
            <div className="font-display text-xs text-secondary tracking-wider mb-2">CONTRACT REASONING</div>
            <p className="text-sm text-foreground leading-relaxed">{reason}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="font-display text-xs tracking-wider text-muted-foreground mb-1">YOUR MATCHES</div>
            <div className="font-display text-2xl text-foreground">{totalGames}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="font-display text-xs tracking-wider text-muted-foreground mb-1">CORRECT GUESSES</div>
            <div className="font-display text-2xl text-primary">{correctGuesses}</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="font-display text-xs tracking-wider text-muted-foreground mb-1">ACCURACY</div>
            <div className="font-display text-2xl text-accent">{accuracy}%</div>
          </div>
        </div>

        {/* Equivalence Principle Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-lg border border-accent/20 bg-accent/5"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <div className="font-display text-xs text-accent tracking-wider mb-1">EQUIVALENCE PRINCIPLE</div>
              <p className="text-xs text-muted-foreground">
                Validator outputs are considered equivalent if they classify the same result (AI or Human), 
                regardless of wording differences. This enables fair consensus despite non-deterministic AI outputs.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Validator Details */}
        <div>
          <h3 className="font-display text-sm text-muted-foreground tracking-wider mb-3">
            VALIDATOR OUTPUTS ({validators.length})
          </h3>
          <div className="space-y-2">
            {validators.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="p-4 rounded-lg border border-border bg-card/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary/60" />
                    <span className="font-display text-xs text-foreground">Validator #{v.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">{v.processingTime}ms</span>
                    <span className={`font-display text-xs font-bold px-2 py-0.5 rounded ${
                      v.classification === 'AI'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {v.classification} ({v.confidence}%)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.reasoning}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-wrap gap-3 justify-center pt-4"
        >
          {appealCount < 3 && (
            <button
              onClick={onAppeal}
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-neon-orange/30 bg-neon-orange/5 text-neon-orange hover:bg-neon-orange/10 transition-all font-display text-xs tracking-wider"
            >
              <Gavel className="w-4 h-4" />
              CHALLENGE RESULT ({5 + appealCount * 2} → {5 + (appealCount + 1) * 2} validators)
            </button>
          )}

          {txHash && (
            <div className="flex items-center gap-2 px-5 py-3 rounded-lg border border-secondary/40 bg-secondary/10">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <div>
                <div className="font-display text-xs text-secondary">Verified on GenLayer</div>
                <a
                  href={`${STUDIONET_EXPLORER}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-[10px] text-muted-foreground hover:text-primary transition-colors"
                >
                  {txHash.slice(0, 16)}...{txHash.slice(-8)}
                </a>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(txHash); }}
                className="ml-2 p-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                title="Copy transaction hash"
              >
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}

          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-display text-xs tracking-wider"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </button>
        </motion.div>
      </div>
    </div>
  );
}
