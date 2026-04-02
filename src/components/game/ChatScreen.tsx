import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Clock, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '@/lib/gameEngine';

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onEndChat: () => void;
}

const MAX_MESSAGES = 8;
const CHAT_DURATION = 30; // 30 seconds

export default function ChatScreen({ messages, onSendMessage, onEndChat }: ChatScreenProps) {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(CHAT_DURATION);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      const remaining = Math.max(0, CHAT_DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onEndChat();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [onEndChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Detect opponent typing
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.sender === 'user') {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1500 + Math.random() * 2000);
      return () => clearTimeout(timeout);
    }
    setIsTyping(false);
  }, [messages]);

  const userMessageCount = messages.filter(m => m.sender === 'user').length;
  const canSend = userMessageCount < MAX_MESSAGES;

  const handleSend = () => {
    if (!input.trim() || !canSend) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border bg-card/50 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-secondary animate-pulse-glow" />
          <span className="font-display text-sm text-foreground tracking-wider">OPPONENT</span>
          <span className="text-xs text-muted-foreground">#{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{userMessageCount}/{MAX_MESSAGES}</span>
          </div>
          <div className={`flex items-center gap-1.5 font-display text-sm ${timeLeft < 30 ? 'text-destructive' : 'text-primary'}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[400px] max-h-[500px] px-1">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md border border-border'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-muted border border-border rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <button
          onClick={onEndChat}
          className="px-4 py-3 rounded-lg bg-accent text-accent-foreground font-display tracking-wider text-xs hover:bg-accent/80 transition-colors whitespace-nowrap"
        >
          I KNOW →
        </button>
        {canSend ? (
          <>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 font-body text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={onEndChat}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display tracking-wider text-sm hover:bg-primary/90 transition-colors"
          >
            END CHAT & GUESS →
          </button>
        )}
      </div>
    </div>
  );
}
