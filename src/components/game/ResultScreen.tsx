import { motion } from 'framer-motion';
import { Bot, User, CheckCircle2, XCircle, AlertTriangle, Shield, ExternalLink, RotateCcw, Gavel, Coins, Copy } from 'lucide-react';
import type { ValidatorResult } from '@/lib/gameEngine';

interface ResultScreenProps {
  userGuess: 'AI' | 'Human';
  consensus: 'AI' | 'Human';
  actualType: 'ai' | 'human';
  validators: ValidatorResult[];
  score: number;
  onAppeal: () => void;
  onVerifyGenLayer: () => void;
  onPlayAgain: () => void;
  walletAddress: string | null;
  txHash: string | null;
  appealCount: number;
}

export default function ResultScreen({
  userGuess, consensus, actualType, validators, score,
  onAppeal, onVerifyGenLayer, onPlayAgain, walletAddress, txHash, appealCount
}: ResultScreenProps) {
  const actual = actualType === 'ai' ? 'AI' : 'Human';
  const userCorrect = userGuess === actual;
  const consensusCorrect = consensus === actual;
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
            <span className="font-display text-xs text-secondary tracking-widest uppercase">Consensus Reached</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            {consensus === 'AI' ? <Bot className="w-10 h-10 text-primary" /> : <User className="w-10 h-10 text-accent" />}
            <h2 className="font-display text-4xl font-bold text-foreground">{consensus}</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {aiVotes} AI votes / {humanVotes} Human votes ({validators.length} validators)
          </p>

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

          {walletAddress && !txHash && (
            <button
              onClick={onVerifyGenLayer}
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-secondary/30 bg-secondary/5 text-secondary hover:bg-secondary/10 transition-all font-display text-xs tracking-wider"
            >
              <ExternalLink className="w-4 h-4" />
              VERIFY ON GENLAYER
            </button>
          )}

          {txHash && (
            <div className="flex items-center gap-2 px-5 py-3 rounded-lg border border-secondary/40 bg-secondary/10">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <div>
                <div className="font-display text-xs text-secondary">Verified on GenLayer</div>
                <a
                  href={`https://explorer-bradbury.genlayer.com/tx/${txHash}`}
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
