import { motion } from 'framer-motion';
import { Brain, Zap, Shield, Users } from 'lucide-react';
import type { AppMode } from '@/lib/gameEngine';
import genturingLogo from '@/assets/genturing-logo.png';
import genlayerLogo from '@/assets/genlayer-logo.png';
import BackgroundParticles from '@/components/game/BackgroundParticles';

interface HomeScreenProps {
  onStartMatch: () => void;
  onModeChange: (mode: AppMode) => void;
  onConnectWallet: () => Promise<boolean>;
  walletAddress: string | null;
  score: number;
  totalGames: number;
  mode: AppMode;
}

export default function HomeScreen({ onStartMatch, onModeChange, onConnectWallet, walletAddress, score, totalGames, mode }: HomeScreenProps) {
  const canStart = Boolean(walletAddress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
    >
      {/* Background effects - all pointer-events-none */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scanlines opacity-20 absolute inset-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent/8 blur-[180px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/6 blur-[150px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <BackgroundParticles />

      {/* Content - ensure it's above background */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto">
        {/* GenLayer badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-5">
          <img src={genlayerLogo} alt="GenLayer" className="w-4 h-4 invert" />
          <span className="font-display text-[10px] tracking-widest text-primary uppercase">Powered by GenLayer · Bradbury Testnet</span>
        </div>

        {/* Logo + Title */}
        <motion.img
          src={genturingLogo}
          alt="GenTuring"
          className="w-24 h-24 rounded-full border-2 border-accent/40 shadow-[0_0_40px_hsl(270_80%_60%/0.3)] mb-4"
          animate={{ boxShadow: ['0 0 30px hsl(270 80% 60% / 0.2)', '0 0 50px hsl(270 80% 60% / 0.4)', '0 0 30px hsl(270 80% 60% / 0.2)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <h1 className="font-display text-4xl md:text-6xl font-bold mb-1">
          <span className="text-glow-purple text-accent">GEN</span>
          <span className="text-glow-cyan text-primary">TURING</span>
        </h1>
        <p className="font-display text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
          The decentralized Turing Test
        </p>

        {/* Headline */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-center">
          Can you tell if you're talking to AI?
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed text-center mb-5 max-w-lg">
          Chat with an unknown opponent and guess if they are human or AI.
          <br />
          <span className="text-primary/80">Verified by decentralized AI consensus.</span>
        </p>

        {/* Stats row */}
        <div className="flex gap-4 mb-5">
          {[
            { value: score, label: 'YOUR SCORE', color: 'text-primary' },
            { value: totalGames, label: 'GAMES', color: 'text-foreground' },
            { value: 5, label: 'VALIDATORS', color: 'text-accent' },
          ].map((s) => (
            <div key={s.label} className="text-center px-5 py-2 rounded-lg border border-border bg-card/50">
              <div className={`font-display text-xl ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mode Toggle */}
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 p-1 mb-5">
          {[
            { value: 'game' as const, label: '🎮 Play Game' },
            { value: 'analyze' as const, label: '🔍 Analyze Content' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => { console.log('Mode switch:', option.value); onModeChange(option.value); }}
              className={`px-5 py-2.5 rounded-full font-display text-xs tracking-widest uppercase transition-all duration-300 ${
                mode === option.value
                  ? 'bg-primary text-primary-foreground box-glow-cyan'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Main CTA */}
        <button
          onClick={() => { console.log('CTA clicked, canStart:', canStart); onStartMatch(); }}
          disabled={!canStart}
          className={`relative px-12 py-4 rounded-lg font-display text-lg font-bold tracking-wider uppercase transition-all mb-4 ${
            canStart
              ? 'bg-primary text-primary-foreground box-glow-cyan hover:bg-primary/90 animate-pulse-glow'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
          }`}
        >
          <Zap className="inline-block mr-2 w-5 h-5" />
          {mode === 'game' ? 'Find Match' : 'Analyze Content'}
        </button>

        {/* Wallet connect prompt */}
        {!walletAddress && (
          <div className="flex flex-col items-center gap-3 mb-4">
            <p className="text-lg text-accent font-display font-bold tracking-wider text-glow-purple animate-pulse">
              ⚡ Connect your wallet to play
            </p>
            <button
              onClick={() => { console.log('Connect wallet clicked'); onConnectWallet(); }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/60 transition-all font-display text-sm tracking-wider uppercase box-glow-purple"
            >
              <Shield className="w-5 h-5" />
              Connect Wallet
            </button>
          </div>
        )}

        {/* Connected wallet badge */}
        {walletAddress && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary/30 bg-secondary/5 mb-4">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-glow" />
            <span className="font-display text-xs text-secondary">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-4">
          {[
            { icon: Brain, label: 'AI Validators', desc: '5+ independent analyzers' },
            { icon: Users, label: 'Democracy', desc: 'Optimistic majority voting' },
            { icon: Zap, label: 'Equivalence', desc: 'Same meaning, not wording' },
            { icon: Shield, label: 'GenLayer', desc: 'On-chain verification' },
          ].map((feat, i) => (
            <div key={i} className="text-center p-3 rounded-lg border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
              <feat.icon className="w-5 h-5 mx-auto mb-1.5 text-primary/70" />
              <div className="font-display text-xs text-foreground mb-0.5">{feat.label}</div>
              <div className="text-[10px] text-muted-foreground">{feat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
