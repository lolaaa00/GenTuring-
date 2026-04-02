import { motion } from 'framer-motion';
import { Brain, Shield } from 'lucide-react';
import type { AppMode } from '@/lib/gameEngine';

interface ValidatingScreenProps {
  mode: AppMode;
}

export default function ValidatingScreen({ mode }: ValidatingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        {/* Brain animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-primary/10"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-primary/20 border-t-primary/60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-14 h-14 text-primary" />
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-primary text-glow-cyan mb-4">
          {mode === 'game' ? 'AI VALIDATORS ANALYZING' : 'CONTENT VALIDATORS ANALYZING'}
        </h2>

        {/* Validator progress */}
        <div className="space-y-3 max-w-sm mx-auto mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.6 }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border bg-card/50"
            >
              <Shield className="w-4 h-4 text-primary/60" />
              <span className="font-display text-xs text-muted-foreground flex-1 text-left">
                Validator #{i}
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: i * 0.6, duration: 1.5 }}
                className="h-1 bg-primary/40 rounded-full max-w-[80px]"
              />
            </motion.div>
          ))}
        </div>

        <p className="text-muted-foreground text-sm">
          Applying <span className="text-primary">Optimistic Democracy</span> &{' '}
          <span className="text-accent">Equivalence Principle</span>
        </p>
      </motion.div>
    </div>
  );
}
