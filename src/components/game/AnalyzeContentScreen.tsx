import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileSearch, Shield } from 'lucide-react';
import BackgroundParticles from '@/components/game/BackgroundParticles';

interface AnalyzeContentScreenProps {
  onAnalyze: (content: string) => void;
  walletAddress: string | null;
}

export default function AnalyzeContentScreen({ onAnalyze, walletAddress }: AnalyzeContentScreenProps) {
  const [content, setContent] = useState('');
  const canAnalyze = Boolean(walletAddress) && Boolean(content.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-4 relative"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="scanlines opacity-20 absolute inset-0" />
      </div>
      <BackgroundParticles />

      <div className="relative z-10 max-w-2xl mx-auto pt-16 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="font-display text-3xl text-foreground font-bold">Analyze Content</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Paste any text to detect whether it was written by an AI or a Human using our decentralized validator network.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card/60 p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <span className="font-display text-xs tracking-widest text-primary uppercase">Content to Analyze</span>
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={"Paste the text you want to analyze here...\n\nCould be a chat message, an essay, a social media post — anything you want to test."}
            className="min-h-[200px] w-full rounded-xl border border-border bg-input px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />

          <button
            onClick={() => { console.log('Analyze clicked'); onAnalyze(content); }}
            disabled={!canAnalyze}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-widest uppercase transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed box-glow-cyan"
          >
            🔍 Analyze with AI Validators
          </button>

          {!walletAddress && (
            <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent text-center">
              Connect your wallet to analyze content
            </div>
          )}
        </motion.div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: Brain, title: 'Non-deterministic outputs', text: 'Independent validators can disagree while still converging on the same classification.' },
            { icon: Shield, title: 'Consensus-based truth', text: 'Final truth comes from majority voting across multiple validator decisions.' },
            { icon: FileSearch, title: 'Human vs AI detection', text: 'Each validator returns a verdict plus a short explanation for transparency.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card/40 p-3">
              <item.icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-display text-xs text-foreground mb-1">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
