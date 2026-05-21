import { motion } from 'framer-motion';
import { Coins, ExternalLink, X } from 'lucide-react';

interface FaucetInfoProps {
  onClose: () => void;
}

export default function FaucetInfo({ onClose }: FaucetInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Get Test Tokens</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="font-display text-xs text-primary mb-2">STEP 1</div>
            <p className="text-sm text-foreground">Connect your Rabby wallet</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="font-display text-xs text-primary mb-2">STEP 2</div>
            <p className="text-sm text-foreground">Open GenLayer Studio and switch to Studionet</p>
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              studio.genlayer.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="font-display text-xs text-primary mb-2">STEP 3</div>
            <p className="text-sm text-foreground">Use the built-in Studionet faucet from the Studio account selector</p>
            <p className="text-xs text-muted-foreground mt-1">Studionet uses GEN on chain ID 61999 and funds are dispensed directly inside Studio.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
