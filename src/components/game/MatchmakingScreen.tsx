import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function MatchmakingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        {/* Animated search ring */}
        <div className="relative w-40 h-40 mx-auto mb-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-4 rounded-full border-2 border-accent/20 border-b-accent"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Search className="w-12 h-12 text-primary" />
          </motion.div>
        </div>

        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-display text-2xl text-primary text-glow-cyan mb-3"
        >
          SEARCHING FOR OPPONENT
        </motion.h2>

        <div className="flex items-center gap-2 justify-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>

        <p className="text-muted-foreground text-sm mt-6 font-display tracking-wider">
          Connecting to decentralized network...
        </p>
      </motion.div>
    </div>
  );
}
