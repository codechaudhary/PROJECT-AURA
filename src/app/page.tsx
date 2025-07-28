'use client';

import { useState, useEffect, memo, useCallback, useRef } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';

// Define the type for our Aura state
type AuraState = {
  reign: string;
  protocol: string;
  startDate: string;
  lastUpheldDate: string | null;
  unbrokenChain: number;
  status: 'oath-active' | 'oath-broken';
  log: Array<{ date: string; text: string }>;
};

// Define the type for our application state
type AppState = 'consent' | 'onboarding' | 'active' | 'broken';

// Animation variants for staggered children
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: "easeInOut" }
  }
};

const textRevealVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.5
    }
  }
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

// Button hover and tap effects
const buttonHoverEffect = { 
  scale: 1.02, 
  boxShadow: '0 0 15px rgba(234,234,234,0.2)',
  background: 'radial-gradient(circle at center, rgba(234,234,234,0.05) 0%, rgba(234,234,234,0) 70%)'
};

const buttonTapEffect = { 
  scale: 0.98 
};

// Web Audio API Sound Utility
const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      // Fix the type issue with webkitAudioContext
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  };

  const playSound = useCallback((type: 'confirm' | 'forge' | 'abdicate') => {
    const context = initAudioContext();
    
    // Create oscillator and gain nodes
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Configure sound based on type
    switch (type) {
      case 'confirm':
        // Sharp, clean, high-frequency click
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime);
        gainNode.gain.setValueAtTime(0.2, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
        break;
        
      case 'forge':
        // Deep, resonant, low-frequency thump with reverb
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(80, context.currentTime);
        gainNode.gain.setValueAtTime(0.7, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.8);
        
        // Add a bit of reverb-like effect with a second oscillator
        const reverbOsc = context.createOscillator();
        const reverbGain = context.createGain();
        reverbOsc.connect(reverbGain);
        reverbGain.connect(context.destination);
        
        reverbOsc.type = 'sine';
        reverbOsc.frequency.setValueAtTime(120, context.currentTime);
        reverbGain.gain.setValueAtTime(0.3, context.currentTime);
        reverbGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1.2);
        
        oscillator.start();
        reverbOsc.start();
        oscillator.stop(context.currentTime + 0.8);
        reverbOsc.stop(context.currentTime + 1.2);
        break;
        
      case 'abdicate':
        // Dissonant, static-like crackle/shatter sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, context.currentTime);
        
        // Frequency modulation for dissonance
        oscillator.frequency.linearRampToValueAtTime(110, context.currentTime + 0.1);
        oscillator.frequency.linearRampToValueAtTime(440, context.currentTime + 0.2);
        oscillator.frequency.linearRampToValueAtTime(110, context.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, context.currentTime + 0.3);
        
        // Add noise-like effect with a second oscillator
        const noiseOsc = context.createOscillator();
        const noiseGain = context.createGain();
        noiseOsc.connect(noiseGain);
        noiseGain.connect(context.destination);
        
        noiseOsc.type = 'square';
        noiseOsc.frequency.setValueAtTime(100, context.currentTime);
        noiseOsc.frequency.linearRampToValueAtTime(500, context.currentTime + 0.2);
        noiseGain.gain.setValueAtTime(0.2, context.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0.01, context.currentTime + 0.4);
        
        oscillator.start();
        noiseOsc.start();
        oscillator.stop(context.currentTime + 0.3);
        noiseOsc.stop(context.currentTime + 0.4);
        break;
    }
  }, []);

  return { playSound };
};

// Sovereign Shard logo component
const SovereignShard = memo<{ className?: string }>(function SovereignShard({ className }) {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M20 2L5 38L20 25L35 38L20 2Z" 
        fill="currentColor"
        className="text-foreground"
      />
      <path 
        d="M20 2L12 20L20 15L28 20L20 2Z" 
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-background"
      />
      <path 
        d="M20 25L15 38L25 38L20 25Z" 
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-background"
      />
    </svg>
  );
});

// Intro Animation Component
const IntroAnimation = memo<{ onComplete: () => void }>(function IntroAnimation({ onComplete }) {
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 3 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          scale: [0.8, 1, 1.1, 0.9],
          filter: [
            'drop-shadow(0 0 0px rgba(255,255,255,0))',
            'drop-shadow(0 0 0px rgba(255,255,255,0))',
            'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
            'drop-shadow(0 0 0px rgba(255,255,255,0))'
          ]
        }}
        transition={{
          duration: 3,
          times: [0, 0.25, 0.5, 1],
          ease: "easeInOut"
        }}
      >
        <SovereignShard className="w-24 h-24" />
      </motion.div>
    </motion.div>
  );
});

// Aura Watermark Component
const AuraWatermark = memo(function AuraWatermark() {
  return (
    <motion.div 
      className="fixed bottom-8 left-8 z-50 opacity-20 hover:opacity-50 transition-opacity duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.2, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          repeatType: "mirror", 
          ease: "easeInOut" 
        }}
      >
        <SovereignShard />
      </motion.div>
    </motion.div>
  );
});

// Custom input component with cinematic forge styling
const ForgeInput = memo<{ 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder: string 
}>(function ForgeInput({ label, value, onChange, placeholder }) {
  return (
    <motion.div 
      className="flex flex-col gap-2 mb-8" 
      variants={itemVariants}
    >
      <label className="font-mono text-secondary-text text-xs tracking-wider uppercase">
        {label}
      </label>
      <input 
        type="text" 
        value={value} 
        onChange={onChange}
        className="bg-transparent border-0 border-b border-border-color p-2 pb-3 text-foreground focus:outline-none focus:border-foreground focus:shadow-[0_0_15px_rgba(234,234,234,0.1)] transition-all duration-300 font-sans placeholder-secondary-text/50"
        placeholder={placeholder}
        style={{ caretColor: 'var(--foreground)' }}
      />
    </motion.div>
  );
});

// Text animation component for letter-by-letter reveal
const AnimatedText = memo<{ text: string, className?: string }>(function AnimatedText({ text, className }) {
  return (
    <motion.span 
      className={className}
      variants={textRevealVariants}
      initial="hidden"
      animate="visible"
    >
      {text.split('').map((char, index) => (
        <motion.span key={index} variants={letterVariants}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
});

// Proof of Work Component
const ProofOfWork = memo<{ 
  onConfirm: (text: string) => void; 
  onCancel: () => void 
}>(function ProofOfWork({ onConfirm, onCancel }) {
  const [logText, setLogText] = useState('');
  const { playSound } = useSoundEffects();
  
  const handleConfirm = useCallback(() => {
    if (logText.trim().length >= 3) {
      playSound('confirm');
      onConfirm(logText);
    }
  }, [logText, onConfirm, playSound]);
  
  return (
    <motion.div 
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-background border border-border-color p-8 max-w-md w-full shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <h2 className="font-mono text-xl text-foreground mb-4 uppercase tracking-wider">Log of Sovereignty</h2>
        <p className="text-secondary-text mb-6">Record what you accomplished today to uphold your oath.</p>
        
        <textarea
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          className="w-full h-32 bg-transparent border border-border-color p-3 text-foreground focus:outline-none focus:border-foreground focus:shadow-[0_0_15px_rgba(234,234,234,0.1)] transition-all duration-300 font-sans placeholder-secondary-text/50 mb-6"
          placeholder="Today I..."
          style={{ caretColor: 'var(--foreground)' }}
        />
        
        <div className="flex justify-between gap-4">
          <motion.button 
            onClick={onCancel}
            className="bg-transparent border border-border-color text-secondary-text py-3 px-6 font-mono tracking-wider uppercase hover:text-foreground transition-colors duration-300 flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            CANCEL
          </motion.button>
          
          <motion.button 
            onClick={handleConfirm}
            disabled={logText.trim().length < 3}
            className="bg-foreground text-background py-3 px-6 font-mono font-bold tracking-wider uppercase hover:bg-[#CCCCCC] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_15px_rgba(234,234,234,0.2)] flex-1"
            whileHover={logText.trim().length >= 3 ? { scale: 1.02 } : {}}
            whileTap={logText.trim().length >= 3 ? { scale: 0.98 } : {}}
          >
            LOG & CONFIRM
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
});

// Consent Screen Component
const ConsentScreen = memo<{ onConsent: () => void }>(function ConsentScreen({ onConsent }) {
  const { playSound } = useSoundEffects();
  
  const handleConsent = useCallback(() => {
    playSound('forge');
    onConsent();
  }, [onConsent, playSound]);
  
  return (
    <motion.div 
      className="flex flex-col items-center text-center max-w-lg"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      key="consent-screen"
    >
      <motion.div 
        className="mb-12 text-xl font-sans leading-relaxed text-foreground/90"
        variants={itemVariants}
      >
        <p className="mb-4">The world does not reward intentions. It rewards unwavering action.</p>
        <p className="mb-4">This is not an app. This is a pact.</p>
        <p>By proceeding, you consent to confront your own truth.</p>
      </motion.div>
      
      <motion.button 
        onClick={handleConsent}
        className="mt-8 bg-transparent border border-foreground text-foreground py-4 px-12 font-mono font-bold tracking-wider uppercase hover:bg-foreground/5 transition-all duration-300"
        variants={itemVariants}
        whileHover={buttonHoverEffect}
        whileTap={buttonTapEffect}
      >
        [ I CONSENT ]
      </motion.button>
    </motion.div>
  );
});

// Onboarding Screen Component
const OnboardingScreen = memo<{ onForgeOath: (reign: string, protocol: string) => void }>(function OnboardingScreen({ onForgeOath }) {
  // Local state for input fields
  const [reign, setReign] = useState('');
  const [protocol, setProtocol] = useState('');
  const { playSound } = useSoundEffects();
  
  // Memoized handlers to prevent unnecessary re-renders
  const handleReignChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setReign(e.target.value);
  }, []);
  
  const handleProtocolChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProtocol(e.target.value);
  }, []);
  
  const handleSubmit = useCallback(() => {
    if (reign && protocol) {
      playSound('forge');
      onForgeOath(reign, protocol);
    }
  }, [reign, protocol, onForgeOath, playSound]);
  
  return (
    <motion.div 
      className="flex flex-col w-full max-w-xl"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      key="onboarding-screen"
    >
      <motion.h1 
        className="font-mono text-3xl font-bold text-foreground mb-12 tracking-wider uppercase"
        variants={itemVariants}
      >
        FORGE YOUR OATH
      </motion.h1>
      
      <ForgeInput 
        label="YOUR REIGN"
        value={reign}
        onChange={handleReignChange}
        placeholder="Launch the first version of my AI startup"
      />
      
      <ForgeInput 
        label="KEYSTONE PROTOCOL"
        value={protocol}
        onChange={handleProtocolChange}
        placeholder="Spend the first 60 minutes of my workday on product development"
      />
      
      <motion.button 
        onClick={handleSubmit}
        disabled={!reign || !protocol}
        className="mt-8 bg-foreground text-background py-4 px-8 font-mono font-bold tracking-wider uppercase hover:bg-[#CCCCCC] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        variants={itemVariants}
        whileHover={reign && protocol ? buttonHoverEffect : {}}
        whileTap={reign && protocol ? buttonTapEffect : {}}
      >
        FORGE MY OATH
      </motion.button>
    </motion.div>
  );
});

// Active Oath Screen Component
const ActiveOathScreen = memo<{ 
  auraState: AuraState, 
  onUpholdOath: () => void, 
  onBreakOath: () => void 
}>(function ActiveOathScreen({ auraState, onUpholdOath, onBreakOath }) {
  const { playSound } = useSoundEffects();
  
  // Check if the oath was already upheld today
  const now = new Date();
  const isUpheldToday = auraState.lastUpheldDate !== null && (() => {
    const lastUpheld = new Date(auraState.lastUpheldDate!);
    return (
      now.getDate() === lastUpheld.getDate() &&
      now.getMonth() === lastUpheld.getMonth() &&
      now.getFullYear() === lastUpheld.getFullYear()
    );
  })();

  const handleUpholdClick = useCallback(() => {
    if (!isUpheldToday) {
      onUpholdOath();
    }
  }, [isUpheldToday, onUpholdOath]);
  
  const handleBreakClick = useCallback(() => {
    playSound('abdicate');
    onBreakOath();
  }, [onBreakOath, playSound]);

  return (
    <motion.div 
      className="flex flex-col w-full max-w-xl"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      key="active-screen"
    >
      <motion.h1 
        className="font-mono text-3xl font-bold text-foreground mb-8 tracking-wider uppercase"
        variants={itemVariants}
      >
        YOUR SOVEREIGNTY
      </motion.h1>
      
      <motion.div 
        className="border-l-2 border-border-color pl-6 py-2 mb-8 hover:border-foreground/50 hover:shadow-[0_0_15px_rgba(234,234,234,0.05)] transition-all duration-300"
        variants={itemVariants}
      >
        <h2 className="font-mono text-xl text-foreground mb-2 uppercase tracking-wider">REIGN</h2>
        <p className="font-sans text-foreground/80 text-lg">{auraState.reign}</p>
      </motion.div>
      
      <motion.div 
        className="border-l-2 border-border-color pl-6 py-2 mb-8 hover:border-foreground/50 hover:shadow-[0_0_15px_rgba(234,234,234,0.05)] transition-all duration-300"
        variants={itemVariants}
      >
        <h2 className="font-mono text-xl text-foreground mb-2 uppercase tracking-wider">PROTOCOL</h2>
        <p className="font-sans text-foreground/80 text-lg">{auraState.protocol}</p>
      </motion.div>
      
      <motion.div 
        className="border-l-2 border-border-color pl-6 py-2 mb-12 hover:border-foreground/50 hover:shadow-[0_0_15px_rgba(234,234,234,0.05)] transition-all duration-300"
        variants={itemVariants}
      >
        <h2 className="font-mono text-xl text-foreground mb-2 uppercase tracking-wider">UNBROKEN CHAIN</h2>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-3xl text-foreground">{auraState.unbrokenChain}</span>
          <span className="font-sans text-secondary-text">days</span>
        </div>
      </motion.div>
      
      <div className="flex flex-col gap-6 mt-4">
        <motion.button 
          onClick={handleUpholdClick}
          disabled={isUpheldToday}
          className="bg-foreground text-background py-4 px-8 font-mono font-bold tracking-wider uppercase hover:bg-[#CCCCCC] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
          variants={itemVariants}
          whileHover={!isUpheldToday ? buttonHoverEffect : {}}
          whileTap={!isUpheldToday ? buttonTapEffect : {}}
        >
          {isUpheldToday ? 'OATH UPHELD TODAY' : 'I UPHELD THE OATH'}
        </motion.button>
        
        <motion.button 
          onClick={handleBreakClick}
          className="bg-transparent text-secondary-text py-4 px-8 font-mono tracking-wider uppercase hover:text-accent-red transition-colors duration-300"
          variants={itemVariants}
          whileHover={{ color: 'var(--accent-red)' }}
        >
          I ABDICATE
        </motion.button>
      </div>
    </motion.div>
  );
});

// Broken Oath Screen Component
const BrokenOathScreen = memo<{ onBeginAnew: () => void }>(function BrokenOathScreen({ onBeginAnew }) {
  const { playSound } = useSoundEffects();
  
  const handleBeginAnew = useCallback(() => {
    playSound('forge');
    onBeginAnew();
  }, [onBeginAnew, playSound]);
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center max-w-md w-full"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      key="broken-screen"
    >
      <motion.div variants={itemVariants}>
        <AnimatedText 
          text="OATH BROKEN. SOVEREIGNTY FORFEITED."
          className="font-mono text-4xl font-bold text-accent-red tracking-wider uppercase block leading-relaxed"
        />
      </motion.div>
      
      <motion.div variants={itemVariants} className="mt-4">
        <AnimatedText 
          text="Your word to yourself is void. Your Unbroken Chain is ashes. This is the reflection of your current character."
          className="font-sans text-foreground/70 text-xl leading-relaxed block"
        />
      </motion.div>
      
      <motion.button 
        onClick={handleBeginAnew}
        className="mt-12 bg-foreground text-background py-4 px-8 font-mono font-bold tracking-wider uppercase hover:bg-[#CCCCCC] transition-all duration-300 max-w-xs"
        variants={itemVariants}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 3.5, duration: 1 } }}
        whileHover={buttonHoverEffect}
        whileTap={buttonTapEffect}
      >
        BEGIN ANEW
      </motion.button>
    </motion.div>
  );
});

// Main Page Component
export default function AuraPage() {
  // Main state management
  const [introCompleted, setIntroCompleted] = useState(false);
  const [appState, setAppState] = useState<AppState>('consent');
  const [auraState, setAuraState] = useState<AuraState | null>(null);
  const [showProofOfWork, setShowProofOfWork] = useState(false);
  const hasInitialized = useRef(false);
  
  // Handle intro completion
  const handleIntroComplete = useCallback(() => {
    setIntroCompleted(true);
  }, []);
  
  // Load state from localStorage on component mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Check if consent has been given
    const consentGiven = localStorage.getItem('auraConsentGiven') === 'true';
    
    if (consentGiven) {
      // Check if oath data exists
      const savedState = localStorage.getItem('auraOathData');
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          
          // Ensure log array exists
          if (!parsedState.log) {
            parsedState.log = [];
          }
          
          setAuraState(parsedState);
          
          // Set app state based on oath status
          if (parsedState.status === 'oath-active') {
            setAppState('active');
          } else if (parsedState.status === 'oath-broken') {
            setAppState('broken');
          }
        } catch (error) {
          console.error('Failed to parse saved state:', error);
          setAppState('onboarding');
        }
      } else {
        // No oath data, go to onboarding
        setAppState('onboarding');
      }
    }
    // If consent not given, stay at 'consent' state (default)
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (auraState) {
      localStorage.setItem('auraOathData', JSON.stringify(auraState));
    }
  }, [auraState]);

  // Memoized event handlers
  const handleConsent = useCallback(() => {
    localStorage.setItem('auraConsentGiven', 'true');
    setAppState('onboarding');
  }, []);

  const handleForgeOath = useCallback((reign: string, protocol: string) => {
    const now = new Date().toISOString();
    const newState: AuraState = {
      reign,
      protocol,
      startDate: now,
      lastUpheldDate: null, // Initialize with null for Day 0
      unbrokenChain: 0,
      status: 'oath-active',
      log: []
    };
    
    setAuraState(newState);
    setAppState('active');
  }, []);

  const handleUpholdOath = useCallback(() => {
    if (!auraState) return;
    
    const now = new Date();
    
    // Check if the oath was already upheld today
    if (auraState.lastUpheldDate !== null) {
      const lastUpheld = new Date(auraState.lastUpheldDate);
      
      if (
        now.getDate() === lastUpheld.getDate() &&
        now.getMonth() === lastUpheld.getMonth() &&
        now.getFullYear() === lastUpheld.getFullYear()
      ) {
        return; // Already upheld today
      }
    }
    
    // Show the Proof of Work dialog
    setShowProofOfWork(true);
  }, [auraState]);
  
  const handleProofOfWorkConfirm = useCallback((logText: string) => {
    if (!auraState) return;
    
    const now = new Date();
    const nowISO = now.toISOString();
    
    // Create the log entry
    const logEntry = {
      date: nowISO,
      text: logText
    };
    
    // Update state optimistically
    const newState: AuraState = {
      ...auraState,
      lastUpheldDate: nowISO,
      unbrokenChain: auraState.unbrokenChain + 1,
      log: [...auraState.log, logEntry]
    };
    
    // Update React state immediately for instant feedback
    setAuraState(newState);
    setShowProofOfWork(false);
    
    // Save to localStorage asynchronously
    setTimeout(() => {
      localStorage.setItem('auraOathData', JSON.stringify(newState));
    }, 0);
  }, [auraState]);
  
  const handleProofOfWorkCancel = useCallback(() => {
    setShowProofOfWork(false);
  }, []);

  const handleBreakOath = useCallback(() => {
    if (!auraState) return;
    
    const brokenState: AuraState = {
      ...auraState,
      status: 'oath-broken'
    };
    
    setAuraState(brokenState);
    setAppState('broken');
  }, [auraState]);

  const handleBeginAnew = useCallback(() => {
    setAppState('onboarding');
  }, []);

  // Render the appropriate screen based on app state
  const renderScreen = () => {
    switch (appState) {
      case 'consent':
        return <ConsentScreen onConsent={handleConsent} />;
        
      case 'onboarding':
        return <OnboardingScreen onForgeOath={handleForgeOath} />;
        
      case 'active':
        if (!auraState) return null;
        return (
          <>
            <ActiveOathScreen 
              auraState={auraState} 
              onUpholdOath={handleUpholdOath} 
              onBreakOath={handleBreakOath} 
            />
            <AnimatePresence>
              {showProofOfWork && (
                <ProofOfWork 
                  onConfirm={handleProofOfWorkConfirm}
                  onCancel={handleProofOfWorkCancel}
                />
              )}
            </AnimatePresence>
          </>
        );
        
      case 'broken':
        return <BrokenOathScreen onBeginAnew={handleBeginAnew} />;
        
      default:
        return null;
    }
  };

  // If intro hasn't completed, show intro animation
  if (!introCompleted) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      {/* Background with radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1A1A1A_0%,_#0A0A0A_60%)] z-0"></div>
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 z-10 opacity-[0.02]"
        style={{ backgroundImage: 'url("/noise.svg")' }}
      ></div>
      
      {/* Aura Watermark */}
      <AuraWatermark />
      
      {/* Main content container */}
      <main className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-center p-6 md:p-12">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>
    </div>
  );
}