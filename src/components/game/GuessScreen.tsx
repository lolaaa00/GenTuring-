import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface GuessScreenProps {
  onGuess: (guess: 'AI' | 'Human') => void;
}

export default function GuessScreen({ onGuess }: GuessScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">
          MAKE YOUR <span className="text-primary text-glow-cyan">GUESS</span>
        </h2>
        <p className="text-muted-foreground mb-10">
          Was your opponent an AI or a Human?
        </p>

        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onGuess('AI')}
            className="group flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all"
          >
            <Bot className="w-16 h-16 text-primary group-hover:text-glow-cyan transition-all" />
            <span className="font-display text-xl font-bold text-primary">AI</span>
            <span className="text-xs text-muted-foreground">Machine Intelligence</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onGuess('Human')}
            className="group flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-accent/30 bg-accent/5 hover:border-accent hover:bg-accent/10 transition-all"
          >
            <User className="w-16 h-16 text-accent group-hover:text-glow-purple transition-all" />
            <span className="font-display text-xl font-bold text-accent">HUMAN</span>
            <span className="text-xs text-muted-foreground">Real Person</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
