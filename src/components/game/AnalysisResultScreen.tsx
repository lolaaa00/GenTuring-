import { motion } from 'framer-motion';
import { FileSearch, RotateCcw, Shield, Sparkles } from 'lucide-react';
import type { ValidatorResult } from '@/lib/gameEngine';

interface AnalysisResultScreenProps {
  content: string;
  consensus: 'AI' | 'Human';
  validators: ValidatorResult[];
  onAnalyzeAnother: () => void;
  onAppeal: () => void;
  appealCount: number;
  reason: string | null;
}

export default function AnalysisResultScreen({
  content,
  consensus,
  validators,
  onAnalyzeAnother,
  onAppeal,
  appealCount,
  reason,
}: AnalysisResultScreenProps) {
  const aiVotes = validators.filter((validator) => validator.classification === 'AI').length;
  const humanVotes = validators.length - aiVotes;
  const winningVotes = Math.max(aiVotes, humanVotes);
  const confidence = Math.round((winningVotes / validators.length) * 100);

  return (
    <div className="min-h-screen p-4 pb-20 relative">
      <div className="absolute inset-0 scanlines pointer-events-none opacity-15" />

      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-primary/40 bg-card/80 p-8 text-center border-glow-cyan"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-4">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="font-display text-xs tracking-widest text-secondary uppercase">Consensus-based truth</span>
          </div>

          <h2 className="font-display text-4xl font-bold text-foreground mb-3">CONTENT CLASSIFIED AS {consensus}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Optimistic Democracy reached consensus with {winningVotes}/{validators.length} validators agreeing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="font-display text-xs text-muted-foreground mb-1">Confidence</div>
              <div className="font-display text-3xl text-primary">{confidence}%</div>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="font-display text-xs text-muted-foreground mb-1">AI Votes</div>
              <div className="font-display text-3xl text-primary">{aiVotes}</div>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="font-display text-xs text-muted-foreground mb-1">Human Votes</div>
              <div className="font-display text-3xl text-accent">{humanVotes}</div>
            </div>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileSearch className="w-4 h-4 text-primary" />
            <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">Analyzed content</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
          <div className="font-display text-xs text-accent tracking-wider mb-1">EQUIVALENCE PRINCIPLE</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Validators can explain the result differently, but outputs are considered equivalent when they reach the same AI/Human classification.
          </p>
        </div>

        {reason && (
          <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
            <div className="font-display text-xs text-secondary tracking-wider mb-1">MODE NOTE</div>
            <p className="text-xs text-foreground leading-relaxed">{reason}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-display text-sm text-muted-foreground tracking-wider">VALIDATOR DECISIONS ({validators.length})</h3>
          {validators.map((validator, index) => (
            <motion.div
              key={validator.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
              className="rounded-xl border border-border bg-card/50 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary/70" />
                  <span className="font-display text-xs text-foreground">Validator #{validator.id}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{validator.processingTime}ms</span>
                  <span className={`font-display px-2 py-1 rounded ${validator.classification === 'AI' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                    {validator.classification} ({validator.confidence}%)
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{validator.reasoning}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 pt-2"
        >
          {appealCount < 3 && (
            <button
              onClick={onAppeal}
              className="px-5 py-3 rounded-xl border border-accent/30 bg-accent/10 text-accent font-display text-xs tracking-widest uppercase transition-all hover:bg-accent/15"
            >
              Re-run consensus ({5 + appealCount * 2} → {5 + (appealCount + 1) * 2} validators)
            </button>
          )}

          <button
            onClick={onAnalyzeAnother}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-display text-xs tracking-widest uppercase transition-all hover:bg-primary/90"
          >
            <RotateCcw className="w-4 h-4" />
            Analyze Another
          </button>
        </motion.div>
      </div>
    </div>
  );
}
